import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, Clock } from 'lucide-react';
import { TodoItem } from '../types/weather';

interface TodoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  todos: TodoItem[];
  onTodosChange: (todos: TodoItem[]) => void;
}

export function TodoDialog({ isOpen, onClose, todos, onTodosChange }: TodoDialogProps) {
  // Local state for todos - only sync with parent when dialog closes
  const [localTodos, setLocalTodos] = useState<TodoItem[]>(todos);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoType, setNewTodoType] = useState({
    indoor: false,
    outdoor: true
  });

  // Sync local state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setLocalTodos(todos);
    }
  }, [isOpen, todos]);

  const handleAddTodo = () => {
    if (!newTodoText.trim()) return;
    if (!newTodoType.indoor && !newTodoType.outdoor) return;

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      createdAt: new Date(),
      type: {
        indoor: newTodoType.indoor,
        outdoor: newTodoType.outdoor
      }
    };

    setLocalTodos(prev => [...prev, newTodo]);
    setNewTodoText('');
    setNewTodoType({
      indoor: false,
      outdoor: true
    });
  };

  const handleToggleTodo = (id: string) => {
    const updatedTodos = localTodos.map(todo => {
      if (todo.id === id) {
        return {
          ...todo,
          completed: !todo.completed,
          completedAt: !todo.completed ? new Date() : undefined
        };
      }
      return todo;
    });
    setLocalTodos(updatedTodos);
  };

  const handleDeleteTodo = (id: string) => {
    setLocalTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const handleClose = () => {
    // Save changes to parent when closing
    onTodosChange(localTodos);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  const getTaskTypeDisplay = (type: { indoor: boolean; outdoor: boolean }) => {
    if (type.indoor && type.outdoor) return 'Indoor & Outdoor';
    if (type.indoor) return 'Indoor';
    if (type.outdoor) return 'Outdoor';
    return 'None';
  };

  const getTaskTypeColor = (type: { indoor: boolean; outdoor: boolean }) => {
    if (type.indoor && type.outdoor) return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
    if (type.indoor) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    if (type.outdoor) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
  };

  const incompleteTodos = localTodos.filter(todo => !todo.completed);
  const completedTodos = localTodos.filter(todo => todo.completed);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">To-Do List</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Add New Todo */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Add New Task</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter a new task..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newTodoType.indoor}
                      onChange={(e) => setNewTodoType(prev => ({
                        ...prev,
                        indoor: e.target.checked
                      }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Indoor</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newTodoType.outdoor}
                      onChange={(e) => setNewTodoType(prev => ({
                        ...prev,
                        outdoor: e.target.checked
                      }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Outdoor</span>
                  </label>
                </div>
              </div>
              
              <button
                onClick={handleAddTodo}
                disabled={!newTodoText.trim() || (!newTodoType.indoor && !newTodoType.outdoor)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
          </div>

          {/* Incomplete Todos */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pending Tasks ({incompleteTodos.length})
              </h3>
            </div>
            
            {incompleteTodos.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No pending tasks. Add some tasks to get AI-powered recommendations!
              </div>
            ) : (
              <div className="space-y-3">
                {incompleteTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
                  >
                    <button
                      onClick={() => handleToggleTodo(todo.id)}
                      className="flex-shrink-0 w-5 h-5 border-2 border-gray-300 dark:border-gray-500 rounded hover:border-green-500 transition-colors"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-gray-900 dark:text-white">{todo.text}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${getTaskTypeColor(todo.type)}`}>
                          {getTaskTypeDisplay(todo.type)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Added {new Date(todo.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Todos */}
          {completedTodos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Check className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Completed Tasks ({completedTodos.length})
                </h3>
              </div>
              
              <div className="space-y-3">
                {completedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 opacity-75"
                  >
                    <button
                      onClick={() => handleToggleTodo(todo.id)}
                      className="flex-shrink-0 w-5 h-5 bg-green-500 border-2 border-green-500 rounded flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-gray-600 dark:text-gray-400 line-through">{todo.text}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${getTaskTypeColor(todo.type)}`}>
                          {getTaskTypeDisplay(todo.type)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Completed {todo.completedAt ? new Date(todo.completedAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info about AI integration */}
          {incompleteTodos.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">💡</div>
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">AI Weekly Planning</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    The AI will schedule all your pending tasks to be completed within this week, 
                    finding the best days and times based on weather, your work schedule, and other activities. 
                    Multiple activities can be scheduled on the same day when time permits.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}