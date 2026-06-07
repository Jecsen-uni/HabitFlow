class Habit {
  const Habit({
    required this.id,
    required this.title,
    required this.frequency,
    required this.targetCount,
    this.description,
  });

  final String id;
  final String title;
  final String frequency;
  final int targetCount;
  final String? description;

  factory Habit.fromJson(Map<String, dynamic> json) {
    return Habit(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      frequency: json['frequency'] as String,
      targetCount: json['targetCount'] as int,
    );
  }
}
