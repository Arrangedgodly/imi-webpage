# MonkeyOS-v2 Complete Visual Art Upgrade Roadmap & Component Lab

> [!IMPORTANT]
> All new art assets, generators, and test suites are strictly isolated in [`gemini-art/`](file:///C:/Users/arran/Projects/monkeyOS-v2/gemini-art). No core game engine files have been overwritten.

We performed a deep visual overhaul across every game subsystem in `monkeyOS-v2` (`ops.js`, `pixel.js`, `core.js`, `readers.js`), re-engineering each component with multi-tone gradient shading, dithered volumetrics, directional light models, and physical bevels.

![Master-Tier Game Components Upgrade Showcase](C:/Users/arran/.t3/userdata/providers/antigravity/ac0a3dfd6dddb20962cecff6ee5fe65e19d3923be20e52c5ab52ff877f7e4c32/antigravity-acp/brain/e463f966-86c1-4135-9562-ac501182e929/game_components_upgrade_showcase.png)

---

## 1. Shading & Depth Engine Architecture ([`game-components.js`](file:///C:/Users/arran/Projects/monkeyOS-v2/gemini-art/game-components.js))

To eliminate flat "paper-cutout" looks and impart genuine 16-bit / 32-bit pixel art weight, we introduced a procedural depth toolkit:
1. **Volumetric Spheres & Cylinders (`Px.sphere`, `Px.cylH`, `Px.cylV`)**: Renders anatomical monkey craniums, snout projections, brass horn bells, and trophy cups with a directional light source at `(-0.35, -0.35)`, producing highlight glints, core shadow terminators, and ambient bounce light.
2. **Integer Dithering (`Px.dither`)**: 50% checkerboard, sparse stippling, and scanline dithering for gradual transitions across wallpapers, clouds, vinyl grooves, velvet curtains, and loamy soil.
3. **Physical Edge Bevels (`Px.bevel`)**: Embossed and debossed 3D moldings for Victorian gilt frames, cast-iron foundry weights, CRT television consoles, and book spine cartouches.
4. **Specular Highlight Accents**: Micro-placed white/cyan glints on glass lenses, metallic rims, water dewdrops, and golden stars.

---

## 2. Upgraded Subsystem Inventory

### 🏛️ The 9 Literary Muses Salon (32x32 Deep Relief Oil Portraits)
- **Deep Molded Gilded Frame**: 5-tone gold & mahogany bevel (`#fff4a0` to `#140c02`) with embossed corner acanthus rosettes and dark velvet matting liner.
- **Background**: Textured damask wallpaper with vertical pinstripes and corner shadow vignette.
- **Primate Authors**: 5-tone volumetric fur & skin shading, sculpted brow ridges, cheekbones, snout overhangs with nostrils, expressive eyes with specular catchlights.
- **Bespoke Author Attire & Artifacts**:
  - **Dr. Zoos**: Cylindrical stovepipe hat with curved red/white stripes, oversized polka-dot silk bowtie with center fold.
  - **Edgar Allan Chimp**: Midnight velvet cravat with drape folds, iridescent violet raven quill with white barb highlights.
  - **Emily Dickinsimian**: Openwork white lace bonnet with checkerboard dither, shaded lilac ribbons, dried rose petal.
  - **Ernest Hemingwape**: Cable-knit ribbed cream sweater, salt-and-pepper dimensional beard, navy captain's cap with brass anchor.
  - **Agatha Chrisbanana**: Houndstooth tweed jacket, pearl necklace with individual gleams, brass monocle with glass lens reflection.
  - **Virginia Woolfkin**: Sage green scarf with drape folds, silver hairpins, carved cameo lighthouse medallion.
  - **Jane Apesten**: Regency amber straw bonnet with pleated lace frill, sealed manuscript with scarlet wax stamp.
  - **J.R.R. Tolkong**: Herringbone tweed vest, carved briarwood pipe with glowing cherry ember and smoke wisps.
  - **Mark Twainana**: Voluminous white three-dimensional mane, sculpted walrus mustache, crisp three-piece white linen suit.

### 🎬 IMI Media Studios Hardware (48x48 Vintage Hardware)
- **Jungle Records**: Polished dark mahogany plinth with burl veneer inlay, grooved 45 RPM vinyl record with quadrant sheen reflections, fluted brass morning-glory horn with scalloped petal ribs and dark interior throat, acoustic tonearm.
- **Canopy TV**: Curved walnut console with mid-century peg legs, recessed CRT bezel, curved phosphor screen with visible scanlines, rabbit-ear antennas, channel selector dials.
- **Vine Radio**: Art Deco cathedral Gothic wooden arch, herringbone woven grille cloth, laser-cut tree fretwork, warm illuminated amber tuning scale with active red indicator needle.
- **Monkey Business Troupe**: Vaudeville proscenium arch with Corinthian columns, heavy draped crimson velvet curtains with bullion fringe, hardwood plank stage with glowing footlight shells, comedy (gold) and tragedy (silver) theatrical drama masks.
- **IMI Pictures**: Heavy cast-iron cine camera body with wrinkle finish, dual 35mm film magazines, rotating lens turret with blue anti-reflective glass reflections, solid ashwood tripod with steel braces, striped director's clapperboard.

### 🌿 Botanical Letter Garden (32x32)
- **Letter Seed Packet**: Heavy kraft paper envelope with 3D folded flap, shadow crease, botanical seed medallion, ribbon binding.
- **Tilled Furrow Plot**: Cedar timber border with square forged nails, fertile dark loamy humus with pebbles, deep planting furrows.
- **Sprouting Cotyledon**: Volumetric twin cotyledon leaves with veins and glistening dewdrops rising from the soil.
- **Budding Alphabet Vine**: Bamboo support stake with notches, twining leafy vine, swelling golden alphabet calyx bud.
- **Ripe Harvest Bloom**: Multi-tier radiant golden petals with starlight glints and crisp 3D alphabet center.
- **Galvanized Watering Can**: Hammered zinc texture with solder seams, tubular handle, flanged brass sprinkler head, refractive water droplets.

### 🍌 Banana Logistics & Shop Artifacts (32x32)
- **Radiant Golden Banana**: 24K solid gold banana with volumetric curved facets, divine radiant aura, diamond star sparkles.
- **Rotten Spotted Banana**: Soft bruised brown fruit with wrinkled skin, penicillin green mold spores, buzzing fruit flies with translucent wings.
- **Machinist Hold Weight**: Cast-iron foundry weight with sand-casting pitting, machined chamfer, brass lifting eyelet ring, stamped recessed "5KG".
- **Mahogany Metronome**: Pyramidal polished rosewood tower, cutout faceplate with beat scale, swinging spring-steel pendulum with sliding brass weight.
- **Tandem Strike Linkage**: Blued-steel mechanical typebars with precision machined lead hammer heads, tension return coil springs, pivot pin.
- **Publishing Contracts**: Aged deckled parchment scroll, rolled edges, calligraphic cursive law text, vermilion wax seal with silk ribbon tails.

### 🏆 Hall of Records & Prestige Awards (32x32)
- **Carved Ironwood Trophy (Tier 1)**: Hand-carved tropical hardwood chalice with organic wood grain, tiered pedestal, carved handles.
- **Chromium Metal Trophy (Tier 2)**: Polished silver chalice with mirror sheen reflections and sculpted aerodynamic handles.
- **Golden Banana Crown Trophy (Tier 3)**: Regal 24K gold trophy crowned with emerald and ruby jewels, brilliant star glints.
- **First Prize Blue Ribbon**: Pleated rosette ribbon with deep shadowed folds, gold foil center star, V-notched streamer tails.
- **8-Point Cosmic Legacy Star**: Multi-faceted celestial star with beveled diamond facets reflecting stellar gold light.

### 📚 Vine Infrastructure Library (16x54 Book Spines)
- 6 Binding tiers with cylindrical 3D leather spine curves, headband and tailband woven cloth, embossed gilded horizontal raised ribs (double gold tooling), gold-bordered title cartouche plaques, and braided silk bookmark tassels.

### ⛅ Canopy Atmosphere & Weather Toys (36x36)
- **Tropical Sun**: 12-point pulsing solar corona rays, volumetric 3D sun sphere, cheerful primate eyes and smile.
- **Drizzle & Monsoon Clouds**: Multi-sphere billowing cumulus clouds with underside ambient occlusion and cascading diagonal raindrop streaks.
- **Thunderstorm with Lightning**: Heavy indigo-slate storm clouds with electric blue-white forked lightning bolt.

---

## 3. Interactive Verification

All components are live and interactive in [`gemini-art/index.html`](file:///C:/Users/arran/Projects/monkeyOS-v2/gemini-art/index.html) under **Section 5: Complete Game Art Upgrade Suite & Component Lab**.
