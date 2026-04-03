import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:go_router/go_router.dart';
import '../../core/repositories/business_repository.dart';
import '../../core/services/location_service.dart';
import '../../core/models/business.dart';

class MapScreen extends ConsumerWidget {
  const MapScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final userPosAsync = ref.watch(userPositionProvider);
    final businessesAsync = ref.watch(featuredBusinessesProvider);

    // Default center: Thika, Kenya
    const defaultCenter = LatLng(-1.0396, 37.0900);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Map View'),
        centerTitle: true,
      ),
      body: businessesAsync.when(
        data: (businesses) {
          final bWithCoords = businesses
              .where((b) => b.latitude != null && b.longitude != null)
              .toList();

          final userPos = userPosAsync.value;
          final center = userPos != null
              ? LatLng(userPos.latitude, userPos.longitude)
              : bWithCoords.isNotEmpty
                  ? LatLng(bWithCoords.first.latitude!, bWithCoords.first.longitude!)
                  : defaultCenter;

          return FlutterMap(
            options: MapOptions(
              initialCenter: center,
              initialZoom: 13.0,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.bizhub.app',
              ),
              MarkerLayer(
                markers: [
                  // User location marker
                  if (userPos != null)
                    Marker(
                      point: LatLng(userPos.latitude, userPos.longitude),
                      width: 40,
                      height: 40,
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.blue,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                          boxShadow: [
                            BoxShadow(color: Colors.blue.withAlpha(80), blurRadius: 12),
                          ],
                        ),
                        child: const Icon(Icons.person, color: Colors.white, size: 20),
                      ),
                    ),
                  // Business markers
                  ...bWithCoords.map((b) => Marker(
                    point: LatLng(b.latitude!, b.longitude!),
                    width: 42,
                    height: 42,
                    child: GestureDetector(
                      onTap: () => _showBusinessSheet(context, b, userPos, theme),
                      child: Container(
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primary,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withAlpha(40), blurRadius: 8),
                          ],
                        ),
                        child: const Icon(Icons.storefront, color: Colors.white, size: 20),
                      ),
                    ),
                  )),
                ],
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error loading businesses: $e')),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => ref.refresh(userPositionProvider),
        child: const Icon(Icons.my_location),
      ),
    );
  }

  void _showBusinessSheet(BuildContext context, Business b, dynamic userPos, ThemeData theme) {
    String? distanceText;
    if (userPos != null && b.latitude != null && b.longitude != null) {
      final km = LocationService.distanceKm(
        userPos.latitude, userPos.longitude,
        b.latitude!, b.longitude!,
      );
      distanceText = LocationService.formatDistance(km);
    }

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              b.name,
              style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withAlpha(25),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(b.category, style: TextStyle(color: theme.colorScheme.primary, fontSize: 12, fontWeight: FontWeight.bold)),
                ),
                if (distanceText != null) ...[
                  const SizedBox(width: 8),
                  Icon(Icons.navigation, size: 14, color: Colors.grey.shade600),
                  const SizedBox(width: 4),
                  Text(distanceText, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                ],
                const Spacer(),
                if (b.rating > 0) ...[
                  const Icon(Icons.star, size: 16, color: Color(0xFFD4AF37)),
                  const SizedBox(width: 4),
                  Text(b.rating.toStringAsFixed(1), style: const TextStyle(fontWeight: FontWeight.bold)),
                ],
              ],
            ),
            if (b.description != null) ...[
              const SizedBox(height: 8),
              Text(
                b.description!,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(color: Colors.grey.shade700),
              ),
            ],
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  context.push('/business/${b.id}');
                },
                child: const Text('View Details'),
              ),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}
