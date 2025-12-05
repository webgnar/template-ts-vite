# Polish Plan - Current Game State

## Current Features Working
- ✅ Player auto-runs right at 350 px/s
- ✅ Jump mechanics with physics (tap to jump)
- ✅ Endless procedural terrain generation
- ✅ Camera follows player smoothly
- ✅ Air trick system (tap while in air changes colors: blue → yellow → orange → red)
- ✅ Collision detection with buildings
- ✅ State machine (RUNNING, JUMPING, IN_AIR, LANDING)

## Polish Tasks Before Adding Rails

### 1. Visual Improvements
- [x] Add background color/gradient (sky blue?) - ✅ Sky blue background added
- [x] Add visual feedback for tricks (scale pulse? rotation?) - ✅ Scale pulse animation
- [ ] Add ground/floor beneath buildings (darker color)
- [ ] Improve building visuals (add borders, shadows?)
- [ ] Smooth color transitions instead of instant changes

### 2. Game Feel & Juice
- [x] Add particle effects on landing (dust cloud) - ✅ Tan dust particles on landing
- [x] Trick name display (e.g., "KICKFLIP!" appears briefly) - ✅ Shows OLLIE!, KICKFLIP!, HEELFLIP!
- [x] Add visual feedback for tricks (scale pulse) - ✅ Player pulses to 1.3x size
- [ ] Screen shake on landing (subtle)
- [ ] Trail effect behind player when doing tricks?
- [ ] Add "air time" visual indicator

### 3. Physics Tuning
- [ ] Test and adjust jump height (feels right?)
- [ ] Test gap sizes (all consistently jumpable?)
- [ ] Adjust run speed (too fast/slow?)
- [ ] Add slight jump arc variation for feel

### 4. UI Elements
- [x] Distance counter (how far you've traveled) - ✅ White distance counter in top-left
- [x] Instructions on start ("TAP TO JUMP") - ✅ Shows for 5 seconds or until first tap
- [x] Death zone handler (fall off screen = restart) - ✅ Auto-restart at y > 700
- [ ] Trick counter/score display

### 5. Game Over & Restart
- [x] Add death zone below screen (y > 700) - ✅ Implemented
- [x] Game over screen with distance traveled - ✅ Shows "GAME OVER" with distance
- [x] Restart button or tap to restart - ✅ Click to restart (page reload)
- [ ] High score tracking (local storage?)

### 6. Performance & Bug Fixes
- [ ] Verify building despawn working correctly
- [ ] Check for any collision bugs
- [ ] Test on different screen sizes
- [ ] Ensure smooth 60fps

### 7. Sound Preparation
- [ ] Identify sound effect needs:
  - Jump sound
  - Landing sound
  - Trick sound (different for each?)
  - Background music loop
- [ ] Create sound event hooks (ready for audio files)

## Priority Order

**✅ High Priority (COMPLETED):**
1. ✅ Death zone & restart functionality
2. ✅ Distance counter UI
3. ✅ Background color
4. ✅ Landing particle effects

**✅ Medium Priority (COMPLETED):**
5. ✅ Trick name display (OLLIE!, KICKFLIP!, HEELFLIP!)
6. ✅ Visual trick feedback (scale pulse animation)
7. ✅ Instructions text ("TAP TO JUMP")
8. ✅ Physics tuning (completed in previous session)

**Low Priority (Nice to Have):**
9. Screen shake
10. Trail effects
11. High score
12. Sound hooks

## Notes
- Keep it simple and focused
- Test after each change
- Mobile-first approach
- Maintain 60fps performance

---

**After polishing, we'll add:**
- Phase 3: Rails & Grinding
- Phase 4: Advanced tricks & combos
