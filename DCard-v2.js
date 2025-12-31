/**
 * DCard.js v2.0 - Enhanced Dantes Card Format Library
 * 
 * Digital Collectibles & Rewards System
 * For INSPIRE Network (ismokeshop.net, inspireclothing.art, dantesworld.art)
 */

class DCard {
  constructor() {
    this.format = 'dcard';
    this.version = 2;
    
    // Specialty badge presets
    this.badgePresets = {
      diamond: { icon: '💎', name: 'Diamond', colors: ['#b9f2ff', '#00d4ff', '#0099ff'] },
      gold: { icon: '🥇', name: 'Gold', colors: ['#ffd700', '#ffed4e', '#ffaa00'] },
      skull: { icon: '💀', name: 'Skull', colors: ['#ffffff', '#cccccc', '#666666'] },
      fire: { icon: '🔥', name: 'Fire', colors: ['#ff6600', '#ff3300', '#cc0000'] },
      leaf: { icon: '🍃', name: 'Leaf', colors: ['#00ff88', '#00cc66', '#009944'] },
      star: { icon: '⭐', name: 'Star', colors: ['#ffff00', '#ffcc00', '#ff9900'] },
      crystal: { icon: '💠', name: 'Crystal', colors: ['#00ffff', '#00ccff', '#0099ff'] },
      crown: { icon: '👑', name: 'Crown', colors: ['#ffd700', '#ffaa00', '#cc8800'] },
      lightning: { icon: '⚡', name: 'Lightning', colors: ['#ffff00', '#ffaa00', '#ff6600'] },
      heart: { icon: '❤️', name: 'Heart', colors: ['#ff0066', '#ff3399', '#ff66cc'] }
    };
  }

  /**
   * Create a new .dcard file (v2.0 with collectibles features)
   */
  async create(options = {}) {
    const issuer = options.issuer || 'INSPIRE';
    const issuedAt = options.issuedAt || new Date().toISOString();

    const card = {
      format: this.format,
      version: this.version,
      fingerprint: '',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      issuer,
      issuedAt,
      
      metadata: {
        // Core identity
        cardId: options.cardId || this.generateId(),
        name: options.name || 'Untitled Card',
        caption: options.caption || '',
        
        // Set information
        set: options.set || 'Custom Set',
        setLogo: options.setLogo || null,
        cardNumber: options.cardNumber || '1',
        totalInSet: options.totalInSet || '1',
        
        // Classification
        rarity: options.rarity || 'common',
        type: options.type || 'collectible',
        category: options.category || 'general',
        
        // Game stats (optional)
        cost: options.cost || '',
        power: options.power || '',
        toughness: options.toughness || '',
        
        // Attribution
        artist: options.artist || 'Unknown',
        brand: options.brand || 'INSPIRE',
        brandLogo: options.brandLogo || null,
        
        // Content
        description: options.description || '',
        flavorText: options.flavorText || '',
        
        // Organization
        tags: options.tags || [],
        
        // Collectible features
        collectible: {
          isReward: options.isReward || false,
          rewardFor: options.rewardFor || '',
          unlockCondition: options.unlockCondition || '',
          mintNumber: options.mintNumber || null,
          totalMinted: options.totalMinted || null,
          serialNumber: options.serialNumber || null,
          releaseDate: options.releaseDate || null,
          editionType: options.editionType || 'standard',

          // Attributes & Traits
          condition: options.condition || 'mint',
          gradingService: options.gradingService || '',
          gradeScore: options.gradeScore || '',
          certificateNumber: options.certificateNumber || '',
          customAttributes: options.customAttributes || '',

          // Ownership & License
          licenseType: options.licenseType || 'all-rights-reserved',
          commercialRights: options.commercialRights || 'none',
          originalOwner: options.originalOwner || '',
          currentOwner: options.currentOwner || '',

          // Provenance
          blockchainHash: options.blockchainHash || '',
          contractAddress: options.contractAddress || '',
          tokenId: options.tokenId || '',
          provenanceNotes: options.provenanceNotes || '',

          // Certification
          certified: options.certified || false,
          artistVerified: options.artistVerified || false,
          limitedEditionBadge: options.limitedEditionBadge || false,
          exclusiveRelease: options.exclusiveRelease || false,
          certAuthority: options.certAuthority || '',
          certDate: options.certDate || null
        },

        custom: options.custom || {}
      },
      
      assets: {
        cardFront: options.cardFront || null,
        cardBack: options.cardBack || null,
        holographicPattern: options.holographicPattern || null,

        // Brand assets
        brandLogo: options.brandLogoAsset || null,
        setLogo: options.setLogoAsset || null,

        // Specialty overlays
        specialtyOverlay: options.specialtyOverlay || null,
        frameOverlay: options.frameOverlay || null,

        thumbnail: options.thumbnail || null,

        audio: {
          theme: options.audioTheme || null,
          effects: options.audioEffects || [],
          settings: {
            volume: options.audioVolume !== undefined ? options.audioVolume : 80,
            fadeIn: options.audioFadeIn !== undefined ? options.audioFadeIn : 2.0,
            fadeOut: options.audioFadeOut !== undefined ? options.audioFadeOut : 2.0,
            startTime: options.audioStartTime !== undefined ? options.audioStartTime : 0,
            loop: options.audioLoop || false,
            autoplay: options.audioAutoplay || false,
            instructions: options.audioInstructions || ''
          }
        }
      },
      
      display: {
        // Holographic effects
        holographic: {
          enabled: options.holographicEnabled !== false,
          intensity: options.holographicIntensity || 0.5,
          pattern: options.holographicPattern || 'rainbow',
          speed: options.holographicSpeed || 1.0,
          angle: options.holographicAngle || 45,
          shift: options.holographicShift || 30,
          primaryColor: options.holographicPrimaryColor || '#00d4ff',
          secondaryColor: options.holographicSecondaryColor || '#ff00aa',
          layered: options.holographicLayered || false,
          blendMode: options.holographicBlendMode || 'overlay',
          customShader: options.customShader || null
        },

        // Specialty badges
        badges: options.badges || [],

        // Visual effects
        effects: {
          glow: options.glowEffect || false,
          glowColor: options.glowColor || '#00ff88',
          glowIntensity: options.glowIntensity || 0.5,

          particles: options.particleEffect || false,
          particleType: options.particleType || 'sparkles',
          particleColor: options.particleColor || '#ffffff',
          particleCount: options.particleCount || 20,

          border: options.borderEffect || false,
          borderStyle: options.borderStyle || 'solid',
          borderColor: options.borderColor || '#00ff88',
          borderWidth: options.borderWidth || 2,

          shadow: options.shadowEffect || false,
          shadowColor: options.shadowColor || '#000000',
          shadowBlur: options.shadowBlur || 20,

          // New visual effects
          blur: options.blurEffect || false,
          blurIntensity: options.blurIntensity || 2,
          blurDirection: options.blurDirection || 'horizontal',

          chromatic: options.chromaticEffect || false,
          chromaticOffset: options.chromaticOffset || 3,

          vignette: options.vignetteEffect || false,
          vignetteStrength: options.vignetteStrength || 0.5,
          vignetteSize: options.vignetteSize || 0.7,

          scanlines: options.scanlinesEffect || false,
          scanlinesDensity: options.scanlinesDensity || 4,
          scanlinesOpacity: options.scanlinesOpacity || 0.3,

          bloom: options.bloomEffect || false,
          bloomThreshold: options.bloomThreshold || 0.8,
          bloomIntensity: options.bloomIntensity || 1.5
        },

        // Color grading
        colorGrading: {
          brightness: options.brightness || 1.0,
          contrast: options.contrast || 1.0,
          saturation: options.saturation || 1.0,
          hueShift: options.hueShift || 0,
          tintColor: options.tintColor || '#ffffff',
          tintStrength: options.tintStrength || 0
        },

        // Animation settings
        animation: {
          rotationSpeed: options.rotationSpeed || 0.005,
          floatAnimation: options.floatAnimation !== false,
          floatRange: options.floatRange || 0.1,
          pulseAnimation: options.pulseAnimation || false,
          pulseSpeed: options.pulseSpeed || 1.0,
          bounceAnimation: options.bounceAnimation || false,
          spinAnimation: options.spinAnimation || false,
          spinDuration: options.spinDuration || 2,
          wobbleAnimation: options.wobbleAnimation || false,
          wobbleIntensity: options.wobbleIntensity || 5,
          flipAnimation: options.flipAnimation || false,
          shakeAnimation: options.shakeAnimation || false,
          swingAnimation: options.swingAnimation || false,
          easing: options.animationEasing || 'ease-in-out',
          customAnimation: options.customAnimation || null
        },

        // Lighting
        lighting: {
          ambient: options.ambientLight || 0.4,
          directional: options.directionalLight || 0.8,
          specular: options.specularLight || 1.0,
          colorTemperature: options.colorTemperature || 6500
        },

        // Rendering & Performance
        rendering: {
          quality: options.renderQuality || 'high',
          textureResolution: options.textureResolution || '2048',
          antiAliasing: options.antiAliasing || 'msaa-4x',
          shadowQuality: options.shadowQuality || 'medium',
          maxFps: options.maxFps || '60',
          vsync: options.vsync || 'on'
        },

        // Export settings
        export: {
          imageCompression: options.imageCompression || 'medium',
          format: options.exportFormat || 'dcard',
          metadataEmbed: options.metadataEmbed || 'full',
          assetOptimization: options.assetOptimization || 'standard',
          embedAssets: options.embedAssets !== false,
          generateThumbnail: options.generateThumbnail || false,
          includeMetadata: options.includeMetadata !== false,
          watermark: options.watermark || false
        },

        // Advanced features
        advanced: {
          debugMode: options.debugMode || false,
          performanceMonitor: options.performanceMonitor || false,
          autoSave: options.autoSave || false,
          versionControl: options.versionControl || false
        },

        // Overlay composition
        overlays: {
          specialty: options.specialtyOverlayConfig || null,
          frame: options.frameOverlayConfig || null,
          badges: options.badgeOverlays || []
        }
      },
      
      interactive: {
        scripts: options.scripts || [],
        gestures: {
          swipe: options.swipeHandler || null,
          pinch: options.pinchHandler || null,
          rotate: options.rotateHandler || null,
          doubleTap: options.doubleTapHandler || null
        },
        
        // Unlock/reveal features
        locked: options.locked || false,
        unlockScript: options.unlockScript || null,
        
        // Social features
        shareable: options.shareable !== false,
        shareMessage: options.shareMessage || ''
      },
      
      signature: {
        creator: options.creator || 'anonymous',
        network: options.network || 'INSPIRE',
        checksum: '',
        verified: false,
        blockchain: options.blockchainHash || null
      }
    };

    // Generate fingerprint
    card.fingerprint = await this.generateFingerprint(card);
    
    // Generate checksum
    card.signature.checksum = await this.generateChecksum(card);

    return card;
  }

  /**
   * Add specialty badge to card
   */
  addBadge(card, badge) {
    const badgeConfig = {
      id: `badge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: badge.type || 'diamond',
      position: badge.position || 'top-right',
      number: badge.number || null,
      color: badge.color || null,
      size: badge.size || 'medium',
      rotation: badge.rotation || 0,
      animation: badge.animation || 'none',
      customIcon: badge.customIcon || null
    };
    
    card.display.badges.push(badgeConfig);
    card.modified = new Date().toISOString();
    return card;
  }

  /**
   * Add specialty overlay
   */
  addSpecialtyOverlay(card, overlay) {
    card.display.overlays.specialty = {
      type: overlay.type || 'custom',
      blendMode: overlay.blendMode || 'overlay',
      opacity: overlay.opacity || 0.5,
      color: overlay.color || '#ffffff',
      pattern: overlay.pattern || null,
      asset: overlay.asset || null
    };
    
    card.modified = new Date().toISOString();
    return card;
  }

  /**
   * Set as reward card
   */
  setAsReward(card, rewardConfig) {
    card.metadata.collectible.isReward = true;
    card.metadata.collectible.rewardFor = rewardConfig.rewardFor || 'Achievement';
    card.metadata.collectible.unlockCondition = rewardConfig.unlockCondition || '';
    
    if (rewardConfig.addBadge) {
      this.addBadge(card, {
        type: 'star',
        position: 'top-left',
        animation: 'pulse'
      });
    }
    
    card.modified = new Date().toISOString();
    return card;
  }

  /**
   * Set mint/serial numbers for limited editions
   */
  setMintInfo(card, mintNumber, totalMinted) {
    card.metadata.collectible.mintNumber = mintNumber;
    card.metadata.collectible.totalMinted = totalMinted;
    card.metadata.collectible.serialNumber = `#${String(mintNumber).padStart(4, '0')}/${String(totalMinted).padStart(4, '0')}`;
    
    card.modified = new Date().toISOString();
    return card;
  }

  // ========================================
  // All previous methods remain the same
  // ========================================

  async load(file) {
    const looksLikeZip = async () => {
      const name = (file.name || '').toLowerCase();
      if (name.endsWith('.zip')) return true;
      if (file.type && file.type.toLowerCase().includes('zip')) return true;

      // Peek at the magic header (PK\u0003\u0004)
      try {
        const slice = file.slice(0, 4);
        const buf = await slice.arrayBuffer();
        const view = new Uint8Array(buf);
        return view[0] === 0x50 && view[1] === 0x4b && view[2] === 0x03 && view[3] === 0x04;
      } catch {
        return false;
      }
    };

    // Check if it's a zip file (even if the extension isn't .zip)
    if (await looksLikeZip()) {
      return this.loadFromZip(file);
    }

    // Use the modern, promise-based File API for more reliable mobile support
    try {
      const text = await file.text();
      const card = JSON.parse(text);

      if (!this.validate(card)) {
        throw new Error('Invalid .dcard file format');
      }

      // Older .dcard exports may be missing a signature block entirely,
      // which would previously throw and leave the UI stuck on the
      // loading overlay. Normalize the structure so verification can run
      // safely regardless of the source file.
      card.signature = card.signature || {};

      const verified = await this.verify(card);
      card.signature.verified = verified;

      return card;
    } catch (error) {
      throw new Error('Failed to parse .dcard file: ' + error.message);
    }
  }

  /**
   * Load card from a zip file with separate asset files
   * Reads the .dcard JSON and loads all referenced assets
   */
  async loadFromZip(file) {
    if (typeof JSZip === 'undefined') {
      throw new Error('JSZip is not loaded. Cannot load zip files.');
    }

    try {
      const zipSource = file instanceof Blob ? await file.arrayBuffer() : file;
      const zip = await JSZip.loadAsync(zipSource);

      // Find the .dcard file
      let dcardFile = null;
      let folderName = null;

      for (const [path, zipEntry] of Object.entries(zip.files)) {
        if (path.endsWith('card.dcard') || path.endsWith('.dcard')) {
          dcardFile = zipEntry;
          // Get folder name from path
          const parts = path.split('/');
          if (parts.length > 1) {
            folderName = parts[0];
          }
          break;
        }
      }

      if (!dcardFile) {
        throw new Error('No .dcard file found in zip');
      }

      // Read the .dcard JSON
      const dcardContent = await dcardFile.async('text');
      const card = JSON.parse(dcardContent);

      if (!this.validate(card)) {
        throw new Error('Invalid .dcard file format');
      }

      // Normalize optional fields that may be missing from legacy exports.
      card.signature = card.signature || {};

      // Helper function to load asset from zip
      const loadAsset = async (assetRef, folder) => {
        if (!assetRef || !assetRef.file) {
          return assetRef; // Return as-is if it's not a file reference
        }

        const assetPath = folder ? `${folder}/${assetRef.file}` : assetRef.file;
        const assetFile = zip.file(assetPath);

        if (!assetFile) {
          console.warn(`Asset file not found: ${assetPath}`);
          return null;
        }

        // Read asset as base64
        const assetData = await assetFile.async('base64');

        const filename = assetRef.file || '';
        const name = assetRef.name || filename.split('/').pop()?.replace(/\.[^.]+$/, '') || '';

        // Return asset in the original format (with base64 data)
        return {
          type: assetRef.type,
          data: assetData,
          width: assetRef.width,
          height: assetRef.height,
          file: filename,
          name,
          filename,
          fileName: filename,
          title: assetRef.title || name
        };
      };

      // Load all assets
      if (card.assets.cardFront && card.assets.cardFront.file) {
        card.assets.cardFront = await loadAsset(card.assets.cardFront, folderName);
      }

      if (card.assets.cardBack && card.assets.cardBack.file) {
        card.assets.cardBack = await loadAsset(card.assets.cardBack, folderName);
      }

      if (card.assets.holographicPattern && card.assets.holographicPattern.file) {
        card.assets.holographicPattern = await loadAsset(card.assets.holographicPattern, folderName);
      }

      if (card.assets.brandLogo && card.assets.brandLogo.file) {
        card.assets.brandLogo = await loadAsset(card.assets.brandLogo, folderName);
      }

      if (card.assets.setLogo && card.assets.setLogo.file) {
        card.assets.setLogo = await loadAsset(card.assets.setLogo, folderName);
      }

      if (card.assets.specialtyOverlay && card.assets.specialtyOverlay.file) {
        card.assets.specialtyOverlay = await loadAsset(card.assets.specialtyOverlay, folderName);
      }

      if (card.assets.frameOverlay && card.assets.frameOverlay.file) {
        card.assets.frameOverlay = await loadAsset(card.assets.frameOverlay, folderName);
      }

      if (card.assets.thumbnail && card.assets.thumbnail.file) {
        card.assets.thumbnail = await loadAsset(card.assets.thumbnail, folderName);
      }

      // Load audio assets
      if (card.assets.audio && card.assets.audio.theme && card.assets.audio.theme.file) {
        card.assets.audio.theme = await loadAsset(card.assets.audio.theme, folderName);
      }

      // Verify the card
      const verified = await this.verify(card);
      card.signature.verified = verified;

      return card;
    } catch (error) {
      throw new Error('Failed to load zip file: ' + error.message);
    }
  }

  validate(card) {
    if (card.format !== 'dcard') return false;
    if (!card.version) return false;
    if (!card.metadata || !card.metadata.cardId) return false;
    if (!card.assets) return false;
    return true;
  }

  async verify(card) {
    try {
      const expectedChecksum = card.signature.checksum;
      const calculatedChecksum = await this.generateChecksum(card);
      return expectedChecksum === calculatedChecksum;
    } catch (error) {
      console.error('Verification failed:', error);
      return false;
    }
  }

  download(card, filename) {
    card.modified = new Date().toISOString();
    const json = JSON.stringify(card, null, 2);
    const blob = new Blob([json], { type: 'application/vnd.dantes.card+json' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `${card.metadata.name.replace(/\s+/g, '-').toLowerCase()}.dcard`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Export card as a zip file with separate asset files
   * This creates a folder structure: {card-name}-{fingerprint}/
   *   - front.png/jpg
   *   - back.png/jpg
   *   - theme.mp3/wav
   *   - card.dcard (JSON with file references)
   */
  async exportWithAssets(card, filename) {
    if (typeof JSZip === 'undefined') {
      console.error('JSZip is not loaded. Using legacy export.');
      return this.download(card, filename);
    }

    card.modified = new Date().toISOString();

    // Create folder name: {card-name}-{fingerprint-hash}
    const cardName = card.metadata.name.replace(/\s+/g, '-').toLowerCase();
    const hash = card.fingerprint.substring(0, 8); // Use first 8 chars of fingerprint
    const folderName = `${cardName}-${hash}`;

    const zip = new JSZip();
    const folder = zip.folder(folderName);

    // Create a copy of the card with file references instead of base64
    const exportCard = JSON.parse(JSON.stringify(card));
    const assetFiles = {};

    // Helper function to get file extension from MIME type
    const getExtension = (mimeType) => {
      const map = {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'audio/mpeg': 'mp3',
        'audio/mp3': 'mp3',
        'audio/wav': 'wav',
        'audio/ogg': 'ogg',
        'audio/webm': 'webm'
      };
      return map[mimeType] || 'bin';
    };

    // Helper function to add asset to zip and update reference
    const addAsset = (asset, assetName) => {
      if (asset && asset.data) {
        const ext = getExtension(asset.type);
        const filename = `${assetName}.${ext}`;

        // Convert base64 to binary and add to zip
        const byteCharacters = atob(asset.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        folder.file(filename, byteArray);

        // Return file reference instead of base64
        return {
          type: asset.type,
          file: filename,
          width: asset.width,
          height: asset.height
        };
      }
      return null;
    };

    // Process all assets
    if (exportCard.assets.cardFront) {
      exportCard.assets.cardFront = addAsset(card.assets.cardFront, 'front');
    }

    if (exportCard.assets.cardBack) {
      exportCard.assets.cardBack = addAsset(card.assets.cardBack, 'back');
    }

    if (exportCard.assets.holographicPattern) {
      exportCard.assets.holographicPattern = addAsset(card.assets.holographicPattern, 'holographic');
    }

    if (exportCard.assets.brandLogo) {
      exportCard.assets.brandLogo = addAsset(card.assets.brandLogo, 'brand-logo');
    }

    if (exportCard.assets.setLogo) {
      exportCard.assets.setLogo = addAsset(card.assets.setLogo, 'set-logo');
    }

    if (exportCard.assets.specialtyOverlay) {
      exportCard.assets.specialtyOverlay = addAsset(card.assets.specialtyOverlay, 'specialty-overlay');
    }

    if (exportCard.assets.frameOverlay) {
      exportCard.assets.frameOverlay = addAsset(card.assets.frameOverlay, 'frame-overlay');
    }

    if (exportCard.assets.thumbnail) {
      exportCard.assets.thumbnail = addAsset(card.assets.thumbnail, 'thumbnail');
    }

    // Process audio assets
    if (exportCard.assets.audio && exportCard.assets.audio.theme) {
      exportCard.assets.audio.theme = addAsset(card.assets.audio.theme, 'theme');
    }

    // Add the .dcard JSON file with file references
    const json = JSON.stringify(exportCard, null, 2);
    folder.file('card.dcard', json);

    // Generate and download the zip
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `${folderName}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async imageToAsset(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            type: file.type,
            data: e.target.result.split(',')[1],
            width: img.width,
            height: img.height
          });
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async audioToAsset(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve({
          type: file.type,
          data: e.target.result.split(',')[1]
        });
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  assetToBlob(asset) {
    if (!asset || !asset.data) return null;
    
    const byteCharacters = atob(asset.data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: asset.type });
  }

  assetToDataURL(asset) {
    if (!asset || !asset.data) return null;
    return `data:${asset.type};base64,${asset.data}`;
  }

  generateId() {
    return `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async generateFingerprint(card) {
    if (typeof window !== 'undefined' && window.DCardCrypto?.computeFingerprint) {
      const { fingerprint } = await window.DCardCrypto.computeFingerprint(card);
      return fingerprint;
    }

    // Fallback hashing for environments without the helper. This hashes core metadata
    // only and is less strict than the canonicalized approach above.

    const data = {
      metadata: card.metadata,
      created: card.created
    };

    const text = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async generateChecksum(card) {
    const data = {
      metadata: card.metadata,
      assets: card.assets,
      display: card.display,
      interactive: card.interactive
    };
    
    const text = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substr(0, 32);
  }

  updateMetadata(card, updates) {
    card.metadata = { ...card.metadata, ...updates };
    card.modified = new Date().toISOString();
    return card;
  }

  addScript(card, script) {
    card.interactive.scripts.push(script);
    card.modified = new Date().toISOString();
    return card;
  }

  getStats(card) {
    const json = JSON.stringify(card);
    const bytes = new Blob([json]).size;
    
    return {
      fileSize: bytes,
      fileSizeFormatted: this.formatBytes(bytes),
      assetCount: Object.keys(card.assets).filter(k => card.assets[k]).length,
      scriptCount: card.interactive.scripts.length,
      badgeCount: card.display.badges ? card.display.badges.length : 0,
      created: new Date(card.created),
      modified: new Date(card.modified),
      verified: card.signature.verified,
      isReward: card.metadata.collectible?.isReward || false,
      mintNumber: card.metadata.collectible?.mintNumber || null
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  async createThumbnail(imageFile, size = 256) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = size;
          canvas.height = size;
          
          ctx.drawImage(img, 0, 0, size, size);
          
          canvas.toBlob((blob) => {
            const thumbReader = new FileReader();
            thumbReader.onload = (e2) => {
              resolve({
                type: 'image/jpeg',
                data: e2.target.result.split(',')[1],
                width: size,
                height: size
              });
            };
            thumbReader.readAsDataURL(blob);
          }, 'image/jpeg', 0.8);
        };
        img.src = e.target.result;
      };

      reader.readAsDataURL(imageFile);
    });
  }
}

function attachDCardToGlobal() {
  // Make the constructor available on the global object for the
  // browser-based viewer (non-module script execution context).
  if (typeof window !== 'undefined') {
    window.DCard = DCard;
  } else if (typeof globalThis !== 'undefined') {
    globalThis.DCard = DCard;
  }
}

attachDCardToGlobal();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DCard;
}
