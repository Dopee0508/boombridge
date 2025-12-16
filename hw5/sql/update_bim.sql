USE BOOMBRIDGE;

-- 更新產品添加 BIM 檔案資料
UPDATE PRODUCT SET 
    bim_code = 'BIM001',
    bim_name = 'Double Action Double Door',
    bim_file = 'Double_action_double_door_8597.rfa',
    bim_thumbnail = 'Double_action_double_door_8597.jpg'
WHERE product_id = '00076758';

UPDATE PRODUCT SET 
    bim_code = 'BIM002',
    bim_name = 'Parallel Flange Channel',
    bim_file = 'Parallel_Flange_Channel_1766.rfa',
    bim_thumbnail = 'Parallel_Flange_Channel_1766.jpg'
WHERE product_id = '00289289';

UPDATE PRODUCT SET 
    bim_code = 'BIM003',
    bim_name = 'Single Exterior Aluminum Door with Transom',
    bim_file = 'Single_Exterior_Aluminum_Door_with_Transom_3837.rfa',
    bim_thumbnail = 'Single_Exterior_Aluminum_Door_with_Transom_3837.jpg'
WHERE product_id = '00435578';

UPDATE PRODUCT SET 
    bim_code = 'BIM004',
    bim_name = 'Skyroofs Kalwall Pre-Engineered SSRR',
    bim_file = 'Skyroofs_Kalwall_Pre-Engineered-SSRR.rfa',
    bim_thumbnail = 'Skyroofs_Kalwall_Pre-Engineered-SSRR.jpg'
WHERE product_id = '00475894';

UPDATE PRODUCT SET 
    bim_code = 'BIM005',
    bim_name = 'Window Casement JELD-WEN Push Out',
    bim_file = 'Window-Casement-JELD-WEN-Push_Out-Siteline-Clad.rfa',
    bim_thumbnail = NULL
WHERE product_id = '00872248';

UPDATE PRODUCT SET 
    bim_code = 'BIM006',
    bim_name = 'SCG Fiber Cement Roof Tile Prima',
    bim_file = '1_กระเบื้องหลังคาไฟเบอร์ซีเมนต์ เอสซีจี รุ่นพรีม่า.rvt',
    bim_thumbnail = NULL
WHERE product_id = '00965138';
