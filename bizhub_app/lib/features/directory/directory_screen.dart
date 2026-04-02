import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bizhub_app/shared/widgets/business_card.dart';
import 'package:bizhub_app/shared/widgets/shimmer_loading.dart';
import 'package:bizhub_app/shared/widgets/empty_state.dart';
import '../../core/repositories/business_repository.dart';
import '../../core/models/business.dart';

class DirectoryScreen extends ConsumerStatefulWidget {
  const DirectoryScreen({super.key});

  @override
  ConsumerState<DirectoryScreen> createState() => _DirectoryScreenState();
}

class _DirectoryScreenState extends ConsumerState<DirectoryScreen> {
  final _searchController = TextEditingController();
  
  String _searchQuery = '';
  String _selectedCategory = 'All Categories';
  String _sortBy = 'newest';
  int _page = 1;
  static const int _limit = 12;

  List<Business> _businesses = [];
  bool _isLoading = true;
  bool _hasMore = true;

  @override
  void initState() {
    super.initState();
    _fetchBusinesses(refresh: true);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchBusinesses({bool refresh = false}) async {
    if (refresh) {
      setState(() {
        _page = 1;
        _isLoading = true;
      });
    }

    try {
      final repo = ref.read(businessRepositoryProvider);
      final newBusinesses = await repo.getBusinesses(
        search: _searchQuery,
        category: _selectedCategory,
        sortBy: _sortBy,
        page: _page,
        limit: _limit,
      );

      setState(() {
        if (refresh) {
          _businesses = newBusinesses;
        } else {
          _businesses.addAll(newBusinesses);
        }
        _hasMore = newBusinesses.length == _limit;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _hasMore = false;
      });
    }
  }

  void _onSearchChanged(String query) {
    if (_searchQuery != query) {
      _searchQuery = query;
      _fetchBusinesses(refresh: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final categoriesAsync = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Directory'),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              decoration: InputDecoration(
                hintText: 'Search businesses, categories...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () {
                          _searchController.clear();
                          _onSearchChanged('');
                        },
                      )
                    : null,
                filled: true,
                fillColor: theme.colorScheme.surface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
              ),
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          // Filters Bar
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  // Sort Dropdown
                  Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary.withAlpha(20),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _sortBy,
                        icon: const Icon(Icons.sort, size: 16),
                        style: TextStyle(
                          color: theme.colorScheme.primary,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                        onChanged: (String? newValue) {
                          if (newValue != null) {
                            setState(() => _sortBy = newValue);
                            _fetchBusinesses(refresh: true);
                          }
                        },
                        items: const [
                          DropdownMenuItem(value: 'newest', child: Text('Newest')),
                          DropdownMenuItem(value: 'rating', child: Text('Top Rated')),
                          DropdownMenuItem(value: 'trending', child: Text('Trending')),
                          DropdownMenuItem(value: 'name', child: Text('A-Z')),
                        ],
                      ),
                    ),
                  ),

                  // Categories Filter
                  categoriesAsync.when(
                    data: (categories) {
                      final allCategories = ['All Categories', ...categories];
                      return Row(
                        children: allCategories.map((cat) {
                          final isSelected = _selectedCategory == cat;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: FilterChip(
                              label: Text(
                                cat,
                                style: TextStyle(
                                  color: isSelected ? Colors.white : theme.colorScheme.onSurface,
                                  fontSize: 12,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                ),
                              ),
                              selected: isSelected,
                              onSelected: (_) {
                                setState(() => _selectedCategory = cat);
                                _fetchBusinesses(refresh: true);
                              },
                              backgroundColor: theme.colorScheme.surface,
                              selectedColor: theme.colorScheme.primary,
                              checkmarkColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                              ),
                            ),
                          );
                        }).toList(),
                      );
                    },
                    loading: () => const ShimmerLoading(width: 80, height: 32, borderRadius: 16),
                    error: (_, __) => const SizedBox.shrink(),
                  ),
                ],
              ),
            ),
          ),

          // Business List
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => _fetchBusinesses(refresh: true),
              child: _isLoading
                  ? ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: 4,
                      itemBuilder: (context, index) => const BusinessCardSkeleton(),
                    )
                  : _businesses.isEmpty
                      ? ListView(
                          children: [
                            SizedBox(height: MediaQuery.of(context).size.height * 0.1),
                            EmptyState(
                              icon: Icons.search_off,
                              title: 'No businesses found',
                              subtitle: 'Try adjusting your search terms or filters',
                              buttonText: 'Clear Filters',
                              onButtonTap: () {
                                _searchController.clear();
                                setState(() {
                                  _searchQuery = '';
                                  _selectedCategory = 'All Categories';
                                  _sortBy = 'newest';
                                });
                                _fetchBusinesses(refresh: true);
                              },
                            ),
                          ],
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _businesses.length + (_hasMore ? 1 : 0),
                          itemBuilder: (context, index) {
                            if (index == _businesses.length) {
                              // Reached end, fetch more
                              if (!_isLoading) {
                                Future.microtask(() {
                                  setState(() => _page++);
                                  _fetchBusinesses(refresh: false);
                                });
                              }
                              return const Center(
                                child: Padding(
                                  padding: EdgeInsets.all(16.0),
                                  child: CircularProgressIndicator(),
                                ),
                              );
                            }
                            return BusinessCardWidget(business: _businesses[index]);
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }
}
