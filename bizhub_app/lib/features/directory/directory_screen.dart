import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/repositories/business_repository.dart';
import '../../core/models/business.dart';
import '../../core/services/location_service.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/widgets/business_card.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/shimmer_loading.dart';

class DirectoryScreen extends ConsumerStatefulWidget {
  final String? initialCategory;

  const DirectoryScreen({super.key, this.initialCategory});

  @override
  ConsumerState<DirectoryScreen> createState() => _DirectoryScreenState();
}

class _DirectoryScreenState extends ConsumerState<DirectoryScreen> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();
  Timer? _debounce;
  String? _selectedCategory;
  String _sortBy = 'newest';
  List<Business> _businesses = [];
  bool _isLoading = false;
  bool _hasMore = true;
  int _page = 1;
  bool _initialLoad = true;

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory;
    _scrollController.addListener(_onScroll);
    _loadBusinesses();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      _resetAndLoad();
    });
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      if (!_isLoading && _hasMore) {
        _loadMoreBusinesses();
      }
    }
  }

  void _resetAndLoad() {
    setState(() {
      _page = 1;
      _businesses.clear();
      _hasMore = true;
    });
    _loadBusinesses();
  }

  Future<void> _loadBusinesses() async {
    if (_isLoading) return;
    setState(() => _isLoading = true);

    try {
      final repo = ref.read(businessRepositoryProvider);
      final results = await repo.getBusinesses(
        search: _searchController.text.trim().isNotEmpty
            ? _searchController.text.trim()
            : null,
        category: _selectedCategory,
        sortBy: _sortBy,
        page: _page,
      );

      // Add distance info if user position available
      final userPos = ref.read(userPositionProvider).value;

      setState(() {
        _businesses = results;
        _hasMore = results.length >= 12;
        _isLoading = false;
        _initialLoad = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _initialLoad = false;
      });
    }
  }

  Future<void> _loadMoreBusinesses() async {
    if (_isLoading) return;
    setState(() => _isLoading = true);

    try {
      _page++;
      final repo = ref.read(businessRepositoryProvider);
      final results = await repo.getBusinesses(
        search: _searchController.text.trim().isNotEmpty
            ? _searchController.text.trim()
            : null,
        category: _selectedCategory,
        sortBy: _sortBy,
        page: _page,
      );

      setState(() {
        _businesses.addAll(results);
        _hasMore = results.length >= 12;
        _isLoading = false;
      });
    } catch (e) {
      _page--;
      setState(() => _isLoading = false);
    }
  }

  double? _distanceForBusiness(Business b) {
    final userPos = ref.read(userPositionProvider).value;
    if (userPos == null || b.latitude == null || b.longitude == null) return null;
    return LocationService.distanceKm(
      userPos.latitude, userPos.longitude,
      b.latitude!, b.longitude!,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final categoriesAsync = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Directory'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.map_outlined),
            tooltip: 'Map View',
            onPressed: () => context.push('/map'),
          ),
          IconButton(
            icon: const Icon(Icons.add_business),
            tooltip: 'Add Business',
            onPressed: () => context.push('/directory/add'),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              decoration: InputDecoration(
                hintText: 'Search businesses...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _resetAndLoad();
                        },
                      )
                    : null,
                filled: true,
                fillColor: SpotifyColors.highlight,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),

          // Category Chips
          SizedBox(
            height: 42,
            child: categoriesAsync.when(
              data: (categories) {
                final allCategories = ['All Categories', ...categories];
                return ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: allCategories.length,
                  itemBuilder: (context, index) {
                    final cat = allCategories[index];
                    final selected = cat == (_selectedCategory ?? 'All Categories');
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: FilterChip(
                        label: Text(cat),
                        selected: selected,
                        onSelected: (_) {
                          setState(() {
                            _selectedCategory = cat == 'All Categories' ? null : cat;
                          });
                          _resetAndLoad();
                        },
                        selectedColor: SpotifyColors.green.withAlpha(40),
                        checkmarkColor: SpotifyColors.green,
                        labelStyle: TextStyle(
                          color: selected ? SpotifyColors.green : SpotifyColors.textSecondary,
                          fontWeight: selected ? FontWeight.bold : FontWeight.normal,
                          fontSize: 13,
                        ),
                      ),
                    );
                  },
                );
              },
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
          ),

          // Sort dropdown
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${_businesses.length} businesses',
                  style: TextStyle(color: SpotifyColors.textSecondary, fontSize: 13),
                ),
                DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _sortBy,
                    icon: const Icon(Icons.sort, size: 18),
                    isDense: true,
                    items: const [
                      DropdownMenuItem(value: 'newest', child: Text('Newest', style: TextStyle(fontSize: 13))),
                      DropdownMenuItem(value: 'rating', child: Text('Top Rated', style: TextStyle(fontSize: 13))),
                      DropdownMenuItem(value: 'trending', child: Text('Trending', style: TextStyle(fontSize: 13))),
                      DropdownMenuItem(value: 'name', child: Text('A-Z', style: TextStyle(fontSize: 13))),
                    ],
                    onChanged: (v) {
                      if (v != null) {
                        setState(() => _sortBy = v);
                        _resetAndLoad();
                      }
                    },
                  ),
                ),
              ],
            ),
          ),

          // Business List
          Expanded(
            child: _initialLoad
                ? ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: 3,
                    itemBuilder: (_, __) => const BusinessCardSkeleton(),
                  )
                : _businesses.isEmpty
                    ? ListView(
                        children: [
                          SizedBox(height: MediaQuery.of(context).size.height * 0.1),
                          EmptyState(
                            icon: Icons.search_off,
                            title: 'No Businesses Found',
                            subtitle: 'Try adjusting your search or filters.',
                            buttonText: 'Clear Filters',
                            onButtonTap: () {
                              _searchController.clear();
                              setState(() {
                                _selectedCategory = null;
                                _sortBy = 'newest';
                              });
                              _resetAndLoad();
                            },
                          ),
                        ],
                      )
                    : RefreshIndicator(
                        onRefresh: () async => _resetAndLoad(),
                        child: ListView.builder(
                          controller: _scrollController,
                          padding: const EdgeInsets.all(16),
                          itemCount: _businesses.length + (_hasMore ? 1 : 0),
                          itemBuilder: (context, index) {
                            if (index == _businesses.length) {
                              return const Padding(
                                padding: EdgeInsets.all(16),
                                child: Center(child: CircularProgressIndicator()),
                              );
                            }

                            final business = _businesses[index];
                            final distance = _distanceForBusiness(business);

                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                BusinessCardWidget(business: business),
                                if (distance != null)
                                  Padding(
                                    padding: const EdgeInsets.only(left: 16, bottom: 8),
                                    child: Row(
                                      children: [
                                        Icon(Icons.navigation, size: 14, color: theme.colorScheme.primary),
                                        const SizedBox(width: 4),
                                        Text(
                                          LocationService.formatDistance(distance),
                                          style: TextStyle(
                                            color: theme.colorScheme.primary,
                                            fontSize: 12,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        Text(
                                          ' away',
                                          style: TextStyle(color: SpotifyColors.textSecondary, fontSize: 12),
                                        ),
                                      ],
                                    ),
                                  ),
                              ],
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
