import 'package:flutter/material.dart';

/// Helper class for handling image URLs with proper error handling
class ImageHelper {
  /// Returns an ImageProvider that handles network errors gracefully
  /// Falls back to an asset if the network image fails to load
  static ImageProvider getImageProvider(String? imageUrl, {String? fallbackAsset}) {
    if (imageUrl == null || imageUrl.isEmpty || imageUrl.contains('placeholder')) {
      // Use asset fallback if available, otherwise use a transparent image
      return fallbackAsset != null
          ? AssetImage(fallbackAsset)
          : const AssetImage('assets/images/placeholder.png');
    }
    
    return NetworkImage(imageUrl);
  }

  /// Widget builder that shows network image with error handling
  static Widget buildNetworkImage({
    required String? imageUrl,
    double? width,
    double? height,
    BoxFit fit = BoxFit.cover,
    Widget? placeholder,
    Widget? errorWidget,
  }) {
    // If URL is null, empty, or a placeholder.com URL, show default
    if (imageUrl == null || imageUrl.isEmpty || imageUrl.contains('placeholder')) {
      return errorWidget ?? _buildDefaultPlaceholder(width, height);
    }

    return Image.network(
      imageUrl,
      width: width,
      height: height,
      fit: fit,
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return placeholder ?? _buildDefaultLoading(width, height);
      },
      errorBuilder: (context, error, stackTrace) {
        return errorWidget ?? _buildDefaultPlaceholder(width, height);
      },
    );
  }

  static Widget _buildDefaultLoading(double? width, double? height) {
    return Container(
      width: width,
      height: height,
      color: Colors.grey[200],
      child: const Center(
        child: CircularProgressIndicator(),
      ),
    );
  }

  static Widget _buildDefaultPlaceholder(double? width, double? height) {
    return Container(
      width: width,
      height: height,
      color: Colors.grey[200],
      child: Icon(
        Icons.image,
        size: (width != null && height != null) ? (width < height ? width : height) / 3 : 40,
        color: Colors.grey[400],
      ),
    );
  }
}
