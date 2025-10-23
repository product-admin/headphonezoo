<?php
/**
 * Plugin Name: HeadphoneZoo Add to Cart AJAX
 * Description: Handles AJAX add to cart functionality for P47 headphones
 * Version: 1.0
 * Author: HeadphoneZoo
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Handle the AJAX add to cart request
function headphonezoo_add_to_cart_callback() {
    // Verify nonce for security (optional but recommended)
    if (!isset($_POST['product_id']) || !isset($_POST['quantity'])) {
        wp_send_json_error('Missing required parameters');
        return;
    }

    $product_id = sanitize_text_field($_POST['product_id']);
    $quantity = sanitize_text_field($_POST['quantity']);
    $selected_color = isset($_POST['selected_color']) ? sanitize_text_field($_POST['selected_color']) : '';

    // Validate product exists and is purchasable
    $product = wc_get_product($product_id);
    if (!$product || !$product->is_purchasable() || !$product->is_in_stock()) {
        wp_send_json_error('Product not available');
        return;
    }

    // Add to cart
    $added = WC()->cart->add_to_cart($product_id, $quantity);

    if ($added === false) {
        wp_send_json_error('Failed to add product to cart');
        return;
    }

    // Add selected color as cart item data if provided
    if ($selected_color && $added) {
        WC()->cart->cart_contents[$added]['selected_color'] = $selected_color;
    }

    // Return success response
    wp_send_json_success(array(
        'message' => 'Product added to cart successfully',
        'cart_url' => wc_get_checkout_url()
    ));
}

// Hook for both logged in and logged out users
add_action('wp_ajax_headphonezoo_add_to_cart', 'headphonezoo_add_to_cart_callback');
add_action('wp_ajax_nopriv_headphonezoo_add_to_cart', 'headphonezoo_add_to_cart_callback');

// Alternative: Add as theme function
// If you prefer to add this to your theme's functions.php instead of creating a plugin,
// uncomment the lines below and comment out the plugin header above

/*
function headphonezoo_add_to_cart_callback() {
    // ... (same code as above)
}

add_action('wp_ajax_headphonezoo_add_to_cart', 'headphonezoo_add_to_cart_callback');
add_action('wp_ajax_nopriv_headphonezoo_add_to_cart', 'headphonezoo_add_to_cart_callback');
*/
?>
