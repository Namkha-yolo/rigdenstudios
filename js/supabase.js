// Supabase integration for Rigden Store
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm'

// Supabase URL and public anon key (safe to expose in client-side code)
const supabaseUrl = 'https://wjhzmlpwxtborscttmqd.supabase.co'
const supabaseKey = 'nT1coZW7By/gKIWMR9WoQh597Cz9rDipuE5+yLncIaa9XSpFox4mW+euKK4Pio9ZxCQS0YIC5QNuZYDaAJnOFA=='

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

// User-related functions
async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error fetching user:', error.message)
    return null
  }
  return user
}

async function signUp(email, password, firstName, lastName) {
  try {
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    })

    if (authError) throw authError

    return { success: true, user: authData.user }
  } catch (error) {
    console.error('Error signing up:', error.message)
    return { success: false, error: error.message }
  }
}

async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    return { success: true, user: data.user, session: data.session }
  } catch (error) {
    console.error('Error signing in:', error.message)
    return { success: false, error: error.message }
  }
}

async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error signing out:', error.message)
    return { success: false, error: error.message }
  }
}

// Product-related functions
async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, products: data }
  } catch (error) {
    console.error('Error fetching products:', error.message)
    return { success: false, error: error.message }
  }
}

async function getProductById(id) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return { success: true, product: data }
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error.message)
    return { success: false, error: error.message }
  }
}

// Order-related functions
async function createOrder(orderData) {
  try {
    // First create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.userId,
        status: 'pending',
        total_amount: orderData.totalAmount,
        shipping_address: orderData.shippingAddress,
        payment_intent_id: orderData.paymentIntentId,
        payment_status: 'pending'
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Then create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_time: item.price
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return { success: true, order }
  } catch (error) {
    console.error('Error creating order:', error.message)
    return { success: false, error: error.message }
  }
}

async function getUserOrders() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, orders }
  } catch (error) {
    console.error('Error fetching orders:', error.message)
    return { success: false, error: error.message }
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date() })
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error

    return { success: true, order: data }
  } catch (error) {
    console.error(`Error updating order ${orderId}:`, error.message)
    return { success: false, error: error.message }
  }
}

// Export all functions for use in other modules
export {
  supabase,
  getCurrentUser,
  signUp,
  signIn,
  signOut,
  getProducts,
  getProductById,
  createOrder,
  getUserOrders,
  updateOrderStatus
}
