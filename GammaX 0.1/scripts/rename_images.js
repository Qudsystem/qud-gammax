const fs = require('fs');
const path = require('path');

const dir = 'ui images';
const renamingMap = {
    "لقطة شاشة 2025-12-24 094058.png": "loading_screen.png",
    "لقطة شاشة 2025-12-24 095423.png": "signup_page.png",
    "لقطة شاشة 2025-12-24 095821.png": "sites_empty_state.png",
    "لقطة شاشة 2025-12-24 095940.png": "ai_images_folder_modal.png",
    "لقطة شاشة 2025-12-24 100520.png": "credits_balance_modal.png",
    "لقطة شاشة 2025-12-24 102034.png": "theme_editor_fonts.png",
    "لقطة شاشة 2025-12-24 102051.png": "theme_editor_logo.png",
    "لقطة شاشة 2025-12-24 102956.png": "theme_editor_design_cards.png",
    "لقطة شاشة 2025-12-24 103017.png": "theme_editor_design_blocks.png",
    "لقطة شاشة 2025-12-24 103038.png": "theme_editor_design_buttons.png",
    "لقطة شاشة 2025-12-24 103053.png": "theme_editor_images_style.png",
    "لقطة شاشة 2025-12-24 103116.png": "theme_editor_accent_images.png",
    "لقطة شاشة 2025-12-24 103915.png": "pricing_modal.png",
    "لقطة شاشة 2025-12-24 104006.png": "account_settings_basic.png",
    "لقطة شاشة 2025-12-24 104023.png": "account_settings_emails.png",
    "لقطة شاشة 2025-12-24 104036.png": "account_settings_security.png",
    "لقطة شاشة 2025-12-24 104051.png": "account_settings_data.png",
    "لقطة شاشة 2025-12-24 113936.png": "create_new_ai_banner.png",
    "لقطة شاشة 2025-12-24 114055.png": "generate_method_card.png",
    "لقطة شاشة 2025-12-24 115254.png": "deck_preview_vertical.png",
    "لقطة شاشة 2025-12-24 124502.png": "import_dropdown.png",
    "لقطة شاشة 2025-12-24 125435.png": "new_gamma_modal.png",
    "لقطة شاشة 2025-12-25 021720.png": "editor_sidebar_outline.png",
    "لقطة شاشة 2025-12-25 022450.png": "create_new_ai_button_small.png",
    "لقطة شاشة 2025-12-25 023806.png": "editor_view.png",
    "لقطة شاشة 2025-12-25 121037.png": "editor_view_future_ai.png",
    "لقطة شاشة 2025-12-25 122353.png": "slide_preview_stats.png"
};

for (const [oldName, newName] of Object.entries(renamingMap)) {
    const oldPath = path.join(dir, oldName);
    const newPath = path.join(dir, newName);
    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed: ${oldName} -> ${newName}`);
    } else {
        console.log(`Not found: ${oldName}`);
    }
}
