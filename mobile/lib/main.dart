import 'package:flutter/material.dart';

import 'models/habit.dart';
import 'services/habit_api.dart';

void main() {
  runApp(const HabitTrackerApp());
}

class HabitTrackerApp extends StatelessWidget {
  const HabitTrackerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Habit Tracker',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
        useMaterial3: true,
      ),
      home: const HabitHomePage(),
    );
  }
}

class HabitHomePage extends StatefulWidget {
  const HabitHomePage({super.key});

  @override
  State<HabitHomePage> createState() => _HabitHomePageState();
}

class _HabitHomePageState extends State<HabitHomePage> {
  final HabitApi _api = HabitApi();
  final TextEditingController _titleController = TextEditingController();
  late Future<List<Habit>> _habits;

  @override
  void initState() {
    super.initState();
    _habits = _api.getHabits();
  }

  @override
  void dispose() {
    _titleController.dispose();
    super.dispose();
  }

  void _refresh() {
    setState(() {
      _habits = _api.getHabits();
    });
  }

  Future<void> _addHabit() async {
    final title = _titleController.text.trim();
    if (title.isEmpty) {
      return;
    }

    await _api.createHabit(title: title);
    _titleController.clear();
    _refresh();
  }

  Future<void> _completeHabit(String id) async {
    await _api.completeHabit(id);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Habit completed for today')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Habit Tracker')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _titleController,
                    decoration: const InputDecoration(
                      labelText: 'New habit',
                      border: OutlineInputBorder(),
                    ),
                    onSubmitted: (_) => _addHabit(),
                  ),
                ),
                const SizedBox(width: 12),
                FilledButton(
                  onPressed: _addHabit,
                  child: const Text('Add'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: FutureBuilder<List<Habit>>(
                future: _habits,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  if (snapshot.hasError) {
                    return Center(child: Text('Error: ${snapshot.error}'));
                  }

                  final habits = snapshot.data ?? [];
                  if (habits.isEmpty) {
                    return const Center(child: Text('No habits yet'));
                  }

                  return ListView.separated(
                    itemCount: habits.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final habit = habits[index];
                      return ListTile(
                        title: Text(habit.title),
                        subtitle: Text('${habit.frequency} target: ${habit.targetCount}'),
                        trailing: IconButton(
                          icon: const Icon(Icons.check_circle_outline),
                          tooltip: 'Complete',
                          onPressed: () => _completeHabit(habit.id),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
