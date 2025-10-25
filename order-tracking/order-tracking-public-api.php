<?php
/*
Plugin Name: Order Tracking Public API
Description: Adds a WP REST endpoint to allow public order tracking (safe fields) for trusted static sites (GitHub Pages). Includes simple admin UI to register allowed origins and their tokens.
Version: 1.0
Author: You
*/

if ( ! defined( 'ABSPATH' ) ) exit;

class OT_Public_API {

    const OPTION_NAME = 'ot_allowed_origins'; // stored as array origin => token

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
        add_action( 'admin_menu', array( $this, 'admin_menu' ) );
        add_action( 'admin_init', array( $this, 'handle_admin_post' ) );
        add_action( 'plugin_action_links_' . plugin_basename( __FILE__ ), array( $this, 'plugin_links' ) );
    }

    public function register_routes() {
        register_rest_route( 'ot-public/v1', '/order', array(
            'methods' => 'POST',
            'callback' => array( $this, 'handle_order_request' ),
            'permission_callback' => '__return_true',
        ));

        // simple OPTIONS handler to respond to preflight requests
        register_rest_route( 'ot-public/v1', '/order', array(
            'methods' => 'OPTIONS',
            'callback' => function() {
                return new WP_REST_Response(null, 200);
            },
            'permission_callback' => '__return_true',
        ));
    }

    private function get_allowed_origins() {
        $list = get_option( self::OPTION_NAME, array() );
        if ( ! is_array( $list ) ) $list = array();
        return $list;
    }

    private function set_cors_headers( $origin ) {
        if ( ! $origin ) return;
        header( 'Access-Control-Allow-Origin: ' . esc_url_raw( $origin ) );
        header( 'Access-Control-Allow-Methods: POST, OPTIONS' );
        header( 'Access-Control-Allow-Headers: Content-Type' );
    }

    private function rate_limit_check() {
        // simple per IP rate limiting: 10 requests per minute
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $key = 'ot_rl_' . md5( $ip );
        $data = get_transient( $key );
        if ( ! $data ) {
            $data = array( 'count' => 1, 'start' => time() );
            set_transient( $key, $data, 60 ); // 60 sec window
            return true;
        }
        if ( $data['count'] >= 10 ) {
            return false;
        }
        $data['count']++;
        set_transient( $key, $data, 60 );
        return true;
    }

    public function handle_order_request( WP_REST_Request $request ) {
        $origin = isset( $_SERVER['HTTP_ORIGIN'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_ORIGIN'] ) ) : '';
        $allowed = $this->get_allowed_origins();

        // Set CORS for the origin if it's allowed - we'll still validate token further
        if ( $origin && array_key_exists( $origin, $allowed ) ) {
            $this->set_cors_headers( $origin );
        } else {
            // origin not registered; block by CORS not being set (but still return generic JSON)
            // You may return 403 to be strict:
            return new WP_REST_Response( array( 'error' => 'Origin not allowed' ), 403 );
        }

        // rate limit
        if ( ! $this->rate_limit_check() ) {
            return new WP_REST_Response( array( 'error' => 'Too many requests' ), 429 );
        }

        $params = $request->get_json_params();
        if ( ! is_array( $params ) ) $params = array();

        $order_id = isset( $params['order_id'] ) ? sanitize_text_field( $params['order_id'] ) : '';
        $email    = isset( $params['email'] ) ? sanitize_email( $params['email'] ) : '';
        $token    = isset( $params['token'] ) ? sanitize_text_field( $params['token'] ) : '';

        if ( empty( $order_id ) || empty( $email ) ) {
            return new WP_REST_Response( array( 'error' => 'Missing parameters (order_id and email required)' ), 400 );
        }

        // verify token supplied matches the token saved for this origin
        $expected_token = $allowed[ $origin ] ?? '';
        if ( empty( $expected_token ) || $token !== $expected_token ) {
            return new WP_REST_Response( array( 'error' => 'Invalid token' ), 403 );
        }

        // Try to load order by ID
        if ( function_exists( 'wc_get_order' ) ) {
            $order = wc_get_order( $order_id );
        } else {
            return new WP_REST_Response( array( 'error' => 'WooCommerce not available on server' ), 500 );
        }

        // if not found by ID, try to search recent orders by email and match order key or id
        if ( ! $order ) {
            $orders = wc_get_orders( array( 'billing_email' => $email, 'limit' => 10 ) );
            foreach ( $orders as $o ) {
                if ( (string) $o->get_id() === (string) $order_id || $o->get_order_key() === $order_id ) {
                    $order = $o;
                    break;
                }
            }
        }

        if ( ! $order ) {
            return new WP_REST_Response( array( 'found' => false, 'message' => 'Order not found' ), 200 );
        }

        // verify billing email matches
        if ( strtolower( $order->get_billing_email() ) !== strtolower( $email ) ) {
            return new WP_REST_Response( array( 'found' => false, 'message' => 'Order not found for this email' ), 200 );
        }

        // Build safe response (do NOT return payment, personal, or card data)
        $items = array();
        foreach ( $order->get_items() as $item ) {
            $product = $item->get_product();
            $items[] = array(
                'name'     => $item->get_name(),
                'quantity' => (int) $item->get_quantity(),
                'subtotal' => wc_price( $order->get_item_subtotal( $item ) ),
                'product_image' => $product ? wp_get_attachment_image_url( $product->get_image_id(), 'thumbnail' ) : null,
            );
        }

        // Example of common tracking meta keys: try to safely read known tracking metas
        $tracking_number = get_post_meta( $order->get_id(), '_tracking_number', true );
        $tracking_provider = get_post_meta( $order->get_id(), '_tracking_provider', true );

        $response = array(
            'found' => true,
            'order_id' => $order->get_id(),
            'order_key' => $order->get_order_key(),
            'status' => $order->get_status(),
            'total' => wc_price( $order->get_total() ),
            'shipping' => wc_price( $order->get_shipping_total() ),
            'items' => $items,
            'shipping_tracking' => $tracking_number ? $tracking_number : null,
            'shipping_provider' => $tracking_provider ? $tracking_provider : null,
            'date_created' => $order->get_date_created() ? $order->get_date_created()->date_i18n( 'c' ) : null,
        );

        return new WP_REST_Response( $response, 200 );
    }

    /* ----------------------- Admin UI ----------------------- */
    public function admin_menu() {
        add_menu_page( 'Order Tracking API', 'Order Tracking API', 'manage_options', 'ot-public-api', array( $this, 'admin_page' ), 'dashicons-admin-network', 80 );
    }

    public function admin_page() {
        if ( ! current_user_can( 'manage_options' ) ) return;

        $allowed = $this->get_allowed_origins();

        ?>
        <div class="wrap">
            <h1>Order Tracking Public API</h1>
            <p>Register trusted origins (your GitHub Pages URLs) and assign a token for each. Your static pages must send that token with requests.</p>

            <h2>Registered origins</h2>
            <table class="widefat fixed">
                <thead><tr><th>Origin</th><th>Token</th><th>Actions</th></tr></thead>
                <tbody>
                <?php if ( empty( $allowed ) ) : ?>
                    <tr><td colspan="3">No origins registered yet.</td></tr>
                <?php else : ?>
                    <?php foreach ( $allowed as $origin => $token ) : ?>
                        <tr>
                            <td><?php echo esc_html( $origin ); ?></td>
                            <td><code><?php echo esc_html( $token ); ?></code></td>
                            <td>
                                <form method="post" style="display:inline;">
                                    <?php wp_nonce_field( 'ot_admin_action', 'ot_admin_nonce' ); ?>
                                    <input type="hidden" name="action" value="ot_delete" />
                                    <input type="hidden" name="origin" value="<?php echo esc_attr( $origin ); ?>" />
                                    <button class="button" type="submit">Delete</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
                </tbody>
            </table>

            <h2>Add new origin</h2>
            <form method="post">
                <?php wp_nonce_field( 'ot_admin_action', 'ot_admin_nonce' ); ?>
                <input type="hidden" name="action" value="ot_add" />
                <table class="form-table">
                    <tr>
                        <th><label for="ot_origin">Origin (include protocol)</label></th>
                        <td><input name="origin" id="ot_origin" type="url" required style="width:400px;" placeholder="https://product-admin.github.io" /></td>
                    </tr>
                    <tr>
                        <th><label for="ot_token">Token (leave empty to auto-generate)</label></th>
                        <td><input name="token" id="ot_token" type="text" style="width:400px;" placeholder="Optional: custom token" /></td>
                    </tr>
                </table>
                <?php submit_button('Add Origin'); ?>
            </form>
        </div>
        <?php
    }

    public function handle_admin_post() {
        if ( ! isset( $_POST['action'] ) ) return;
        if ( ! isset( $_POST['ot_admin_nonce'] ) || ! wp_verify_nonce( $_POST['ot_admin_nonce'], 'ot_admin_action' ) ) return;
        if ( ! current_user_can( 'manage_options' ) ) return;

        $action = sanitize_text_field( $_POST['action'] );
        $allowed = $this->get_allowed_origins();

        if ( $action === 'ot_add' ) {
            $origin = isset( $_POST['origin'] ) ? esc_url_raw( trim( wp_unslash( $_POST['origin'] ) ) ) : '';
            $token = isset( $_POST['token'] ) ? sanitize_text_field( trim( wp_unslash( $_POST['token'] ) ) ) : '';

            if ( empty( $origin ) ) return;
            if ( empty( $token ) ) {
                // generate 32 char token
                $token = wp_generate_password( 32, false, false );
            }

            $allowed[ $origin ] = $token;
            update_option( self::OPTION_NAME, $allowed );
            // redirect to avoid resubmit
            wp_safe_redirect( admin_url( 'admin.php?page=ot-public-api' ) );
            exit;
        }

        if ( $action === 'ot_delete' ) {
            $origin = isset( $_POST['origin'] ) ? esc_url_raw( trim( wp_unslash( $_POST['origin'] ) ) ) : '';
            if ( isset( $allowed[ $origin ] ) ) {
                unset( $allowed[ $origin ] );
                update_option( self::OPTION_NAME, $allowed );
            }
            wp_safe_redirect( admin_url( 'admin.php?page=ot-public-api' ) );
            exit;
        }
    }

    public function plugin_links( $links ) {
        $links[] = '<a href="' . admin_url( 'admin.php?page=ot-public-api' ) . '">Settings</a>';
        return $links;
    }
}

new OT_Public_API();