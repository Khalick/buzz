import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:palette_generator/palette_generator.dart';
import '../../core/theme/app_theme.dart';

/// Reusable header widget that extracts the dominant color from an image
/// and creates a Spotify-style gradient fading into #121212.
class SpotifyGradientHeader extends StatefulWidget {
  final String? imageUrl;
  final double height;
  final Widget child;

  const SpotifyGradientHeader({
    super.key,
    this.imageUrl,
    this.height = 300,
    required this.child,
  });

  @override
  State<SpotifyGradientHeader> createState() => _SpotifyGradientHeaderState();
}

class _SpotifyGradientHeaderState extends State<SpotifyGradientHeader> {
  Color _dominantColor = SpotifyColors.surface;
  bool _loaded = false;

  @override
  void initState() {
    super.initState();
    _extractColor();
  }

  @override
  void didUpdateWidget(covariant SpotifyGradientHeader oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.imageUrl != widget.imageUrl) {
      _extractColor();
    }
  }

  Future<void> _extractColor() async {
    if (widget.imageUrl == null || widget.imageUrl!.isEmpty) {
      setState(() => _loaded = true);
      return;
    }
    try {
      final paletteGenerator = await PaletteGenerator.fromImageProvider(
        CachedNetworkImageProvider(widget.imageUrl!),
        size: const Size(50, 50),
        maximumColorCount: 8,
      );
      if (mounted) {
        setState(() {
          _dominantColor = paletteGenerator.dominantColor?.color ??
              paletteGenerator.vibrantColor?.color ??
              SpotifyColors.surface;
          _loaded = true;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loaded = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 500),
      curve: Curves.easeOut,
      height: widget.height,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            _dominantColor.withAlpha(_loaded ? 200 : 0),
            SpotifyColors.background,
          ],
          stops: const [0.0, 1.0],
        ),
      ),
      child: widget.child,
    );
  }
}
