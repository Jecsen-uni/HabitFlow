import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/habit.dart';

class HabitApi {
  HabitApi({http.Client? client, String? baseUrl})
      : _client = client ?? http.Client(),
        _baseUrl = baseUrl ?? 'http://10.0.2.2:3000/api';

  final http.Client _client;
  final String _baseUrl;

  Future<List<Habit>> getHabits() async {
    final response = await _client.get(Uri.parse('$_baseUrl/habits'));
    _throwIfFailed(response);

    final body = jsonDecode(response.body) as Map<String, dynamic>;
    final data = body['data'] as List<dynamic>;
    return data.map((item) => Habit.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<void> createHabit({
    required String title,
    String frequency = 'daily',
    int targetCount = 1,
  }) async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/habits'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'title': title,
        'frequency': frequency,
        'targetCount': targetCount,
      }),
    );

    _throwIfFailed(response);
  }

  Future<void> completeHabit(String habitId) async {
    final today = DateTime.now().toIso8601String().substring(0, 10);
    final response = await _client.post(
      Uri.parse('$_baseUrl/habits/$habitId/logs'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'completedOn': today}),
    );

    _throwIfFailed(response);
  }

  void _throwIfFailed(http.Response response) {
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('API request failed: ${response.statusCode}');
    }
  }
}
