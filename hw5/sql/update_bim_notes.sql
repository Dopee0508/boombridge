USE BOOMBRIDGE;

-- 更新 BIM 物件的詳細規格說明
UPDATE PRODUCT SET 
    bim_notes = 'Thermal Insulation (in W/m2K): up to Uw = 0.73 (standard size)
• Sound reduction window: up to Rw = 48 dB
• Burglar-inhibiting window: RC1, RC2, RC2N
• Construction Depth: 82.5 mm
• Iron mounting: concealed or visible
• Available frame size:
Width: 2070 mm
Height: 2500 mm
Please notice: width and height of the element are depending on the construction type!

Optional available with:
• IKP® (intensive care insulation)
• STV® (static dry glazing)
• Acryicolor
• Feilsd (uni-colours and wood décor)
• Aluminum shell
• Overlap gasket

Realizable are:
• Passive house windows
• Kfw-55 windows
• Kfw-70 windows
• Fixed windows

System complementary elements like doorsets or lift and slide doors are available.'
WHERE product_id = '00076758';

UPDATE PRODUCT SET 
    bim_notes = 'Parallel Flange Channel (PFC) structural steel section
• Material: Structural steel Grade S275 or equivalent
• Standard: EN 10365
• Surface finish: Hot rolled
• Typical sizes available: 100mm to 430mm depth
• Usage: Beams, columns, structural frames
• Suitable for welding and bolting connections'
WHERE product_id = '00289289';

UPDATE PRODUCT SET 
    bim_notes = 'Single Exterior Aluminum Door with Transom
• Material: Aluminum frame with thermal break
• Glass: Low-E insulated glazing unit
• Thermal performance: U-value up to 1.4 W/m²K
• Air tightness: Class 4
• Water tightness: Class E750
• Wind resistance: Class C5
• Security: Multi-point locking system
• Finish: Powder coated (multiple colors available)
• Transom height: Customizable'
WHERE product_id = '00435578';

UPDATE PRODUCT SET 
    bim_notes = 'Skyroofs Kalwall Pre-Engineered Skylight System
• System Type: SSRR (Standing Seam Ridge Rib)
• Panel Material: Kalwall translucent sandwich panels
• Light transmission: up to 20%
• Thermal performance: U-value 0.28-0.57 W/m²K
• Impact resistance: Meets building code requirements
• UV protection: Blocks 99% harmful UV rays
• Self-cleaning exterior surface
• Low maintenance requirement
• Custom sizes available
• Pre-engineered for easy installation'
WHERE product_id = '00475894';

UPDATE PRODUCT SET 
    bim_notes = 'JELD-WEN Siteline Clad Casement Window
• Operation: Push-out casement
• Frame: Wood interior with aluminum cladding exterior
• Glass: Standard or Low-E insulated glass
• Energy efficiency: Energy Star certified
• Hardware: Multi-point locking system
• Finish: Factory-finished interior, maintenance-free exterior
• Screen: Optional insect screen available
• Warranty: Limited lifetime warranty
• Various size configurations available'
WHERE product_id = '00872248';

UPDATE PRODUCT SET 
    bim_notes = 'SCG Fiber Cement Roof Tile - Prima Series
• Material: High-quality fiber cement
• Finish: Smooth surface with protective coating
• Colors: Multiple color options available
• Dimensions: Standard Thai roof tile size
• Weight: Lightweight compared to concrete tiles
• Durability: Weather resistant, fade resistant
• Fire rating: Class A fire resistance
• Warranty: 15 years limited warranty
• Easy installation with standard roofing accessories
• Suitable for residential and commercial applications
• Made in Thailand by SCG'
WHERE product_id = '00965138';
