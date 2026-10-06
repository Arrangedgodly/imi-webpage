/**
 * MonkeyOS v2 - Typewriter Styles Verification Test Suite
 * Tests all 6 canonical typewriter models and Mk I / Mk II / Mk III restoration tiers.
 */

const TypewriterStyles = require('./typewriter-styles.js');

function runTests() {
  console.log('=== Typewriter Styles Test Suite ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Canonical Models Count & IDs
  const expectedModels = [    { id: 'mint',   name: 'Bamboo Classic',   num: 1, primary: '#78d9a0', medallion: 'BAMBOO CLASSIC NO. 1' },
    { id: 'rose',   name: 'Hibiscus Ribbon',  num: 2, primary: '#f08aa4', medallion: 'HIBISCUS RIBBON NO. 2' },
    { id: 'blue',   name: 'Lagoon Sprint',    num: 3, primary: '#5fa8f0', medallion: 'LAGOON SPRINT NO. 3' },
    { id: 'amber',  name: 'Honeycomb Ledger', num: 4, primary: '#f2b23a', medallion: 'HONEYCOMB LEDGER NO. 4' },
    { id: 'orchid', name: 'Orchid Imperial',  num: 5, primary: '#b58cf0', medallion: 'ORCHID IMPERIAL NO. 5' },
    { id: 'moon',   name: 'Moonflower Grand', num: 6, primary: '#dfe3f2', medallion: 'MOONFLOWER GRAND NO. 6' }
  ];

  assert(typeof TypewriterStyles.TYPEWRITER_MODELS === 'object', 'TYPEWRITER_MODELS is exported');
  assert(Object.keys(TypewriterStyles.TYPEWRITER_MODELS).length === 6, 'All 6 canonical models defined');

  expectedModels.forEach(exp => {
    const model = TypewriterStyles.TYPEWRITER_MODELS[exp.id];
    assert(model !== undefined, `Model ${exp.id} exists`);
    assert(model.name === exp.name, `Model ${exp.id} name is '${exp.name}'`);
    assert(model.modelNo === exp.num, `Model ${exp.id} modelNo is ${exp.num}`);
    assert(model.medallionText === exp.medallion, `Model ${exp.id} medallion text is '${exp.medallion}'`);
    assert(model.primary.light.toLowerCase() === exp.primary.toLowerCase(), `Model ${exp.id} primary enamel matches ${exp.primary}`);
  });

  // 2. Normalization Helpers
  assert(TypewriterStyles.normalizeModelId('mint') === 'mint', "normalizeModelId('mint') === 'mint'");
  assert(TypewriterStyles.normalizeModelId('MINT') === 'mint', "normalizeModelId('MINT') === 'mint'");
  assert(TypewriterStyles.normalizeModelId(1) === 'mint', "normalizeModelId(1) === 'mint'");
  assert(TypewriterStyles.normalizeModelId('2') === 'rose', "normalizeModelId('2') === 'rose'");
  assert(TypewriterStyles.normalizeModelId('orchid') === 'orchid', "normalizeModelId('orchid') === 'orchid'");
  assert(TypewriterStyles.normalizeModelId('moonflower') === 'moon', "normalizeModelId('moonflower') === 'moon'");
  assert(TypewriterStyles.normalizeModelId('unknown_xyz') === 'mint', "normalizeModelId unknown fallback to 'mint'");

  assert(TypewriterStyles.normalizeMkLevel(1) === 1, 'normalizeMkLevel(1) === 1');
  assert(TypewriterStyles.normalizeMkLevel(2) === 2, 'normalizeMkLevel(2) === 2');
  assert(TypewriterStyles.normalizeMkLevel("3") === 3, 'normalizeMkLevel("3") === 3');
  assert(TypewriterStyles.normalizeMkLevel('Mk II') === 2, "normalizeMkLevel('Mk II') === 2");
  assert(TypewriterStyles.normalizeMkLevel('mk3') === 3, "normalizeMkLevel('mk3') === 3");

  // 3. Palette Generation for all 18 combinations (6 models x 3 tiers)
  expectedModels.forEach(exp => {
    [1, 2, 3].forEach(mk => {
      const pal = TypewriterStyles.getTypewriterPalette(exp.id, mk);
      assert(pal !== null, `Palette generated for ${exp.id} Mk ${mk}`);
      assert(pal.id === exp.id, `Palette ID matches ${exp.id}`);
      assert(pal.mkLevel === mk, `Palette Mk level is ${mk}`);
      assert(typeof pal.ironBlack === 'string' && pal.ironBlack.startsWith('#'), `Palette has ironBlack hex string`);
      assert(typeof pal.brassLight === 'string' && pal.brassLight.startsWith('#'), `Palette has brassLight hex string`);
      assert(typeof pal.keyFace === 'string' && pal.keyFace.startsWith('#'), `Palette has keyFace hex string`);
      assert(typeof pal.keyLetter === 'string' && pal.keyLetter.startsWith('#'), `Palette has keyLetter hex string`);
      assert(typeof pal.chassis.pinstripePrimary === 'string', `Palette has chassis.pinstripePrimary`);

      // Mk Tier differences
      if (mk === 1) {
        assert(pal.medallion.hasCrown === false, `${exp.id} Mk I has no crown crest`);
      } else if (mk === 2) {
        assert(pal.medallion.hasCrown === false, `${exp.id} Mk II has no crown crest`);
        assert(pal.medallion.hasScrolls === true, `${exp.id} Mk II has scrolls/rosettes`);
      } else if (mk === 3) {
        assert(pal.medallion.hasCrown === true, `${exp.id} Mk III has regal crown crest`);
        assert(pal.medallion.hasScrolls === true, `${exp.id} Mk III has gold leaf scrolls`);
      }
    });
  });

  // 4. Mock Canvas Context for Medallion & Chassis Drawing
  const mockCtx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    rects: [],
    arcs: [],
    fillRect(x, y, w, h) {
      this.rects.push({ x, y, w, h, fill: this.fillStyle });
    },
    beginPath() { this.arcs = []; },
    arc(x, y, r, sa, ea) { this.arcs.push({ x, y, r }); },
    fill() {},
    stroke() {},
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    moveTo() {},
    lineTo() {}
  };

  expectedModels.forEach(exp => {
    [1, 2, 3].forEach(mk => {
      mockCtx.rects = [];
      TypewriterStyles.drawTypewriterMedallion(mockCtx, exp.id, mk, 192, 108);
      assert(mockCtx.rects.length > 50, `drawTypewriterMedallion drew ${mockCtx.rects.length} pixel rects for ${exp.id} Mk ${mk}`);

      // Verify Mk III crown crest draws extra pixels
      if (mk === 3) {
        const topRects = mockCtx.rects.filter(r => r.y < 108 - 7);
        assert(topRects.length > 10, `${exp.id} Mk III drew crown crest pixel spires above medallion`);
      }
    });
  });

  // 5. Chassis Drawing Test
  mockCtx.rects = [];
  TypewriterStyles.drawTypewriterChassis(mockCtx, 'mint', 1, 192, 145);
  assert(mockCtx.rects.length > 30, 'drawTypewriterChassis executed successfully');

  // 6. Ribbon Spool Drawing Test (Stepped pure pixel art)
  mockCtx.rects = [];
  TypewriterStyles.drawTypewriterSpool(mockCtx, 100, 100, 0, true, 'blue', 2);
  assert(mockCtx.rects.length > 50, 'drawTypewriterSpool drew pure stepped pixel art spool');

  // 7. Full Stage Rasterizer Test (renderTypewriterStyled)
  const mockStage = {
    modelId: 'rose',
    mkLevel: 3,
    carriageX: 0,
    platenAngle: 0,
    leverAngle: 0,
    paperLines: ['TEST LINE'],
    currentLineText: 'HELLO',
    paperScrollY: 0,
    tickerAngle: 0,
    escapementDog: 0,
    typebarProgress: 0,
    leftSpoolAngle: 0,
    rightSpoolAngle: 0,
    keys: [
      { ch: 'A', x: 100, y: 150, baseY: 150, depressedY: 0, isDown: false }
    ],
    spacebar: {
      x: 192, y: 190, baseY: 190, w: 100, h: 7, depressedY: 0, isDown: false
    }
  };
  mockCtx.rects = [];
  TypewriterStyles.renderTypewriterStyled(mockStage, mockCtx, (v) => Math.round(v));
  assert(mockCtx.rects.length > 100, `renderTypewriterStyled rendered ${mockCtx.rects.length} pixel rects`);

  // 8. ProtoEngine Extension Adapter Test
  class MockStageClass {
    initKeyboard() {}
    renderTypewriter() {}
  }
  const mockProtoEngine = {
    TypewriterPixelStage: MockStageClass
  };

  const enhanced = TypewriterStyles.enhanceProtoEngine(mockProtoEngine);
  assert(enhanced === true, 'enhanceProtoEngine succeeded');
  assert(typeof MockStageClass.prototype.setModel === 'function', 'Stage has setModel method');

  const instance = new MockStageClass();
  instance.setModel('orchid', 3);
  assert(instance.modelId === 'orchid', "instance.modelId === 'orchid'");
  assert(instance.mkLevel === 3, "instance.mkLevel === 3");
  assert(instance.palette !== undefined, "instance.palette is defined");
  assert(instance.palette.id === 'orchid', "instance.palette.id === 'orchid'");

  console.log(`\n=== Test Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

if (typeof module !== 'undefined' && require.main === module) {
  runTests();
}

module.exports = { runTests };
