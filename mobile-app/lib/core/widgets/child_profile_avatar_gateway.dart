import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'child_avatar_button.dart';
import '../providers/children_provider.dart';
import '../../features/children/widgets/child_selector_sheet.dart';
import '../../features/children/widgets/child_quick_actions_modal.dart';

/// Gateway widget: child avatar in app bar. Uses ChildrenProvider.
/// Tap: no child → Add Child flow; one child → Child Profile; multiple → selector.
/// Long-press: Quick actions (assessment, progress, book session).
/// Status ring: goodProgress / inProgress / needsAttention (default inProgress).
class ChildProfileAvatarGateway extends StatelessWidget {
  final ChildAvatarStatus status;
  final double size;

  const ChildProfileAvatarGateway({
    super.key,
    this.status = ChildAvatarStatus.inProgress,
    this.size = 44,
  });

  @override
  Widget build(BuildContext context) {
    final childrenProvider = context.watch<ChildrenProvider>();
    final children = childrenProvider.children;
    final selected = childrenProvider.selectedChild;
    final selectedId = childrenProvider.selectedChildId;

    void onTap() {
      if (children.isEmpty) {
        context.push('/children/select');
        return;
      }
      if (children.length == 1) {
        context.push('/children/${children.first.id}');
        return;
      }
      showChildSelectorSheet(
        context,
        children: children,
        selectedChildId: selectedId,
        onSelect: (id) {
          childrenProvider.setSelectedChildId(id);
          context.push('/children/$id');
        },
      );
    }

    void onLongPress() {
      if (children.isEmpty) return;
      final childId = selectedId ?? children.first.id;
      final c = childrenProvider.getChildById(childId);
      showChildQuickActionsModal(
        context,
        childId: childId,
        childName: c?.name,
      );
    }

    return ChildAvatarButton(
      childId: selected?.id,
      imageUrl: selected?.profileImageUrl,
      name: selected?.name,
      status: status,
      onTap: onTap,
      onLongPress: children.isEmpty ? null : onLongPress,
      size: size,
    );
  }
}
