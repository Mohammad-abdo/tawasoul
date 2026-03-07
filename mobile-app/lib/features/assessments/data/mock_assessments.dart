/// 12 assessment categories: attention & cognitive skills.
/// Each category: score 0-5, time, attempts, accuracy (normalized DB structure).
class MockAssessmentsData {
  // 12 categories for attention & cognitive skills (Mahara)
  static final List<Map<String, dynamic>> categories = [
    {
      'id': 'cat_visual_attention',
      'title': 'الانتباه البصري',
      'icon': 'visibility',
      'color': 0xFF6C9BD2,
      'description': 'تركيز على الصور والأشكال',
      'emoji': '👁️',
    },
    {
      'id': 'cat_auditory_attention',
      'title': 'الانتباه السمعي',
      'icon': 'hearing',
      'color': 0xFF9B6CD2,
      'description': 'الاستماع وتمييز الأصوات',
      'emoji': '👂',
    },
    {
      'id': 'cat_attention_span',
      'title': 'مدة الانتباه',
      'icon': 'schedule',
      'color': 0xFFD26C9B,
      'description': 'الحفاظ على التركيز لفترة',
      'emoji': '⏱️',
    },
    {
      'id': 'cat_short_term_memory',
      'title': 'الذاكرة قصيرة المدى',
      'icon': 'psychology',
      'color': 0xFF6CD29B,
      'description': 'تذكر المعلومات الحديثة',
      'emoji': '🧠',
    },
    {
      'id': 'cat_visual_memory',
      'title': 'الذاكرة البصرية',
      'icon': 'image',
      'color': 0xFFD2B86C,
      'description': 'تذكر الصور والتسلسلات البصرية',
      'emoji': '🖼️',
    },
    {
      'id': 'cat_reaction_speed',
      'title': 'سرعة الاستجابة',
      'icon': 'bolt',
      'color': 0xFF6CD2D2,
      'description': 'الاستجابة السريعة للمؤثرات',
      'emoji': '⚡',
    },
    {
      'id': 'cat_motor_coordination',
      'title': 'التنسيق الحركي',
      'icon': 'sports_esports',
      'color': 0xFFD26C6C,
      'description': 'التناسق بين العين واليد',
      'emoji': '🎯',
    },
    {
      'id': 'cat_problem_solving',
      'title': 'حل المشكلات',
      'icon': 'lightbulb',
      'color': 0xFF9BD26C,
      'description': 'التفكير المنطقي واتخاذ القرار',
      'emoji': '💡',
    },
    {
      'id': 'cat_instruction_following',
      'title': 'اتباع التعليمات',
      'icon': 'list_alt',
      'color': 0xFF6C6CD2,
      'description': 'تنفيذ الخطوات بالترتيب',
      'emoji': '📋',
    },
    {
      'id': 'cat_cognitive_flexibility',
      'title': 'المرونة المعرفية',
      'icon': 'swap_horiz',
      'color': 0xFFD29B6C,
      'description': 'التبديل بين المهام والقواعد',
      'emoji': '🔄',
    },
    {
      'id': 'cat_behavioral_control',
      'title': 'التحكم السلوكي',
      'icon': 'self_improvement',
      'color': 0xFF6CD2D2,
      'description': 'ضبط الانفعالات والانتظار',
      'emoji': '🌱',
    },
    {
      'id': 'cat_motivation_engagement',
      'title': 'الدافعية والمشاركة',
      'icon': 'favorite',
      'color': 0xFFD26C9B,
      'description': 'الرغبة في المشاركة والاستمرار',
      'emoji': '⭐',
    },
  ];

  static final List<Map<String, dynamic>> tests = [
    // Visual Attention
    {
      'id': 'test_visual_attention',
      'categoryId': 'cat_visual_attention',
      'title': 'البحث البصري',
      'description': 'اعثر على الشكل المطابق',
      'icon': 'visibility',
    },
    // Auditory Attention
    {
      'id': 'test_sound_animals',
      'categoryId': 'cat_auditory_attention',
      'title': 'أصوات الحيوانات',
      'description': 'تعرف على أصوات الحيوانات',
      'icon': 'pets',
    },
    {
      'id': 'test_sound_daily',
      'categoryId': 'cat_auditory_attention',
      'title': 'الأصوات اليومية',
      'description': 'تمييز الأصوات اليومية',
      'icon': 'home',
    },
    // Attention Span
    {
      'id': 'test_attention_span',
      'categoryId': 'cat_attention_span',
      'title': 'متابعة القصة',
      'description': 'تابع القصة حتى النهاية',
      'icon': 'menu_book',
    },
    // Short-Term Memory
    {
      'id': 'test_short_term_memory',
      'categoryId': 'cat_short_term_memory',
      'title': 'تذكر التسلسل',
      'description': 'تذكر ترتيب العناصر',
      'icon': 'psychology',
    },
    // Visual Memory
    {
      'id': 'test_visual_memory',
      'categoryId': 'cat_visual_memory',
      'title': 'ما الذي تغير؟',
      'description': 'اكتشف التغيير في الصورة',
      'icon': 'image',
    },
    // Reaction Speed
    {
      'id': 'test_reaction_speed',
      'categoryId': 'cat_reaction_speed',
      'title': 'اضغط بسرعة',
      'description': 'استجب عند ظهور الإشارة',
      'icon': 'bolt',
    },
    // Motor Coordination
    {
      'id': 'test_motor_coordination',
      'categoryId': 'cat_motor_coordination',
      'title': 'التتبع باليد',
      'description': 'اتبع المسار بالإصبع',
      'icon': 'sports_esports',
    },
    // Problem Solving
    {
      'id': 'test_problem_solving',
      'categoryId': 'cat_problem_solving',
      'title': 'ترتيب القصة',
      'description': 'رتب الصور لتكوين قصة',
      'icon': 'lightbulb',
    },
    {
      'id': 'test_sequence_story',
      'categoryId': 'cat_problem_solving',
      'title': 'ترتيب قصة',
      'description': 'رتب الصور لتكوين قصة',
      'icon': 'menu_book',
    },
    // Instruction Following
    {
      'id': 'test_instruction_following',
      'categoryId': 'cat_instruction_following',
      'title': 'نفّذ الخطوات',
      'description': 'نفذ التعليمات بالترتيب',
      'icon': 'list_alt',
    },
    {
      'id': 'test_sequence_daily',
      'categoryId': 'cat_instruction_following',
      'title': 'ترتيب الأنشطة اليومية',
      'description': 'رتب الأنشطة بالترتيب الصحيح',
      'icon': 'schedule',
    },
    // Cognitive Flexibility
    {
      'id': 'test_cognitive_flexibility',
      'categoryId': 'cat_cognitive_flexibility',
      'title': 'تبديل القواعد',
      'description': 'غيّر الطريقة حسب التعليمات',
      'icon': 'swap_horiz',
    },
    // Behavioral Control
    {
      'id': 'test_behavioral_control',
      'categoryId': 'cat_behavioral_control',
      'title': 'انتظر دورك',
      'description': 'انتظر الإشارة قبل الإجابة',
      'icon': 'self_improvement',
    },
    // Motivation & Engagement
    {
      'id': 'test_pronounce_words',
      'categoryId': 'cat_motivation_engagement',
      'title': 'نطق الكلمات',
      'description': 'استمع وكرر الكلمات',
      'icon': 'record_voice_over',
    },
    {
      'id': 'test_match_animals',
      'categoryId': 'cat_visual_memory',
      'title': 'ربط الحيوانات بأصواتها',
      'description': 'اختر صورة الحيوان الذي يطابق الصوت',
      'icon': 'pets',
    },
    {
      'id': 'test_pronounce_letters',
      'categoryId': 'cat_motivation_engagement',
      'title': 'نطق الحروف',
      'description': 'استمع وكرر الحروف العربية',
      'icon': 'text_fields',
    },
    {
      'id': 'test_match_objects',
      'categoryId': 'cat_visual_memory',
      'title': 'ربط الأشياء بأصواتها',
      'description': 'اختر صورة الشيء الذي يطابق الصوت',
      'icon': 'category',
    },
  ];

  /// Stage boundaries: each test has list of stage end indices.
  /// E.g. [1, 3, 5] = stage0: activities 0-1, stage1: 2-3, stage2: 4-5.
  /// Pass threshold per stage (0.0-1.0). Default 0.5 (50%).
  static const double stagePassThreshold = 0.5;

  static Map<String, List<int>> get testStageBoundaries {
    final all = activitiesByTestId;
    final result = <String, List<int>>{};
    for (final e in all.entries) {
      final list = e.value;
      if (list.isEmpty) {
        result[e.key] = [];
      } else if (list.length <= 2) {
        result[e.key] = List.generate(list.length, (i) => i);
      } else {
        final perStage = (list.length / 2).ceil().clamp(1, 3);
        final boundaries = <int>[];
        for (var i = perStage - 1; i < list.length; i += perStage) {
          boundaries.add(i);
        }
        if (boundaries.isEmpty || boundaries.last != list.length - 1) {
          boundaries.add(list.length - 1);
        }
        result[e.key] = boundaries;
      }
    }
    return result;
  }

  /// Get activities grouped by stage for a test.
  static List<List<Map<String, dynamic>>> getStagesForTest(String testId) {
    final activities = activitiesByTestId[testId] ?? [];
    if (activities.isEmpty) return [];
    final boundaries = testStageBoundaries[testId] ?? [activities.length - 1];
    final stages = <List<Map<String, dynamic>>>[];
    var start = 0;
    for (final end in boundaries) {
      stages.add(activities.sublist(start, end + 1));
      start = end + 1;
    }
    if (start < activities.length) {
      stages.add(activities.sublist(start));
    }
    return stages;
  }

  // Activities for each test (reuse existing types)
  static final Map<String, List<Map<String, dynamic>>> activitiesByTestId = {
    'test_visual_attention': [
      {
        'id': 'act_va_1',
        'type': 'listen_watch',
        'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
      },
      {
        'id': 'act_va_2',
        'type': 'listen_choose',
        'options': [
          {'id': 'opt_1', 'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800', 'isCorrect': true},
          {'id': 'opt_2', 'imageUrl': 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800', 'isCorrect': false},
        ],
      },
    ],
    'test_sound_animals': [
      {
        'id': 'act_1',
        'type': 'listen_watch',
        'audioUrl': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
      },
      {
        'id': 'act_2',
        'type': 'listen_choose',
        'audioUrl': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        'options': [
          {'id': 'opt_1', 'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800', 'isCorrect': true},
          {'id': 'opt_2', 'imageUrl': 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800', 'isCorrect': false},
          {'id': 'opt_3', 'imageUrl': 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800', 'isCorrect': false},
        ],
      },
    ],
    'test_sound_daily': [
      {
        'id': 'act_4',
        'type': 'listen_watch',
        'audioUrl': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
      },
      {
        'id': 'act_5',
        'type': 'listen_choose',
        'audioUrl': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        'options': [
          {'id': 'opt_4', 'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800', 'isCorrect': false},
          {'id': 'opt_5', 'imageUrl': 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800', 'isCorrect': true},
        ],
      },
    ],
    'test_attention_span': [
      {'id': 'act_asp_1', 'type': 'listen_watch', 'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800'},
      {'id': 'act_asp_2', 'type': 'listen_watch', 'imageUrl': 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800'},
    ],
    'test_short_term_memory': [
      {
        'id': 'act_stm_1',
        'type': 'sequence',
        'items': [
          {'id': 'seq_1', 'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800'},
          {'id': 'seq_2', 'imageUrl': 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800'},
          {'id': 'seq_3', 'imageUrl': 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800'},
        ],
        'correctSequence': ['seq_1', 'seq_2', 'seq_3'],
      },
    ],
    'test_visual_memory': [
      {'id': 'act_vm_1', 'type': 'listen_watch', 'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800'},
      {'id': 'act_vm_2', 'type': 'listen_choose', 'options': [
        {'id': 'o1', 'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800', 'isCorrect': true},
        {'id': 'o2', 'imageUrl': 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800', 'isCorrect': false},
      ]},
    ],
    'test_reaction_speed': [
      {'id': 'act_rs_1', 'type': 'listen_watch', 'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800'},
    ],
    'test_motor_coordination': [
      {'id': 'act_mc_1', 'type': 'listen_watch', 'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800'},
    ],
    'test_problem_solving': [
      {
        'id': 'act_ps_1',
        'type': 'sequence',
        'items': [
          {'id': 'seq_1', 'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800'},
          {'id': 'seq_2', 'imageUrl': 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800'},
          {'id': 'seq_3', 'imageUrl': 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800'},
        ],
        'correctSequence': ['seq_1', 'seq_2', 'seq_3'],
      },
    ],
    'test_sequence_story': [
      {
        'id': 'act_9',
        'type': 'sequence',
        'items': [
          {'id': 'seq_1', 'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800'},
          {'id': 'seq_2', 'imageUrl': 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800'},
          {'id': 'seq_3', 'imageUrl': 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800'},
        ],
        'correctSequence': ['seq_1', 'seq_2', 'seq_3'],
      },
    ],
    'test_instruction_following': [
      {'id': 'act_if_1', 'type': 'listen_watch', 'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800'},
      {'id': 'act_if_2', 'type': 'listen_choose', 'options': [
        {'id': 'o1', 'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800', 'isCorrect': true},
        {'id': 'o2', 'imageUrl': 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800', 'isCorrect': false},
      ]},
    ],
    'test_sequence_daily': [
      {
        'id': 'act_sd_1',
        'type': 'sequence',
        'items': [
          {'id': 'seq_1', 'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800'},
          {'id': 'seq_2', 'imageUrl': 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800'},
        ],
        'correctSequence': ['seq_1', 'seq_2'],
      },
    ],
    'test_cognitive_flexibility': [
      {'id': 'act_cf_1', 'type': 'listen_watch', 'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800'},
    ],
    'test_behavioral_control': [
      {'id': 'act_bc_1', 'type': 'listen_watch', 'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800'},
    ],
    'test_pronounce_words': [
      {'id': 'act_6', 'type': 'audio_association', 'audioUrl': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800'},
      {'id': 'act_7', 'type': 'audio_association', 'audioUrl': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'imageUrl': 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800'},
    ],
    'test_match_animals': [
      {
        'id': 'act_8',
        'type': 'matching',
        'items': [
          {'id': 'match_1', 'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800', 'audioUrl': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'},
          {'id': 'match_2', 'imageUrl': 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800', 'audioUrl': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'},
        ],
      },
    ],
    'test_pronounce_letters': [
      {'id': 'act_pl_1', 'type': 'listen_watch', 'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800'},
    ],
    'test_match_objects': [
      {
        'id': 'act_mo_1',
        'type': 'matching',
        'items': [
          {'id': 'm1', 'imageUrl': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800', 'audioUrl': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'},
          {'id': 'm2', 'imageUrl': 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=800', 'audioUrl': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'},
        ],
      },
    ],
  };
}
