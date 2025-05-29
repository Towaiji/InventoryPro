import { supabase } from './supabaseClient';

export const getStores = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching stores:', error);
    return [];
  }
  return data;
};

export const addStore = async (storeData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('stores')
    .insert([{ ...storeData, user_id: user.id }])
    .select()
    .single();
  if (error) {
    console.error('Error adding store:', error);
    return null;
  }
  return data;
};

export const getInventoryByStore = async (storeId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: storeCheck, error: storeCheckError } = await supabase
    .from('stores')
    .select('id')
    .eq('id', storeId)
    .eq('user_id', user.id)
    .single();

  if (storeCheckError || !storeCheck) {
    console.error('Error fetching store or permission denied for inventory:', storeCheckError);
    return [];
  }
  
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      categories (name)
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching inventory by store:', error);
    return [];
  }
  return data.map(item => ({ ...item, category: item.categories?.name || 'Uncategorized', category_id: item.category_id }));
};

export const getAllInventory = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: userStores, error: userStoresError } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id);
  
  if (userStoresError || !userStores || userStores.length === 0) {
    console.error('Error fetching user stores or no stores found:', userStoresError);
    return [];
  }

  const storeIds = userStores.map(s => s.id);

  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      categories (name)
    `)
    .in('store_id', storeIds)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching all inventory:', error);
    return [];
  }
  return data.map(item => ({ ...item, category: item.categories?.name || 'Uncategorized', category_id: item.category_id }));
};


export const addInventoryItem = async (itemData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: storeCheck, error: storeCheckError } = await supabase
    .from('stores')
    .select('id')
    .eq('id', itemData.store_id)
    .eq('user_id', user.id)
    .single();

  if (storeCheckError || !storeCheck) {
    console.error('Error adding item or permission denied for store:', storeCheckError);
    return null;
  }

  const { category, ...restOfItemData } = itemData;

  let categoryId = null;
  if (category) {
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', category)
      .single();

    if (categoryError && categoryError.code !== 'PGRST116') { 
      console.error('Error fetching category:', categoryError);
    } else if (categoryData) {
      categoryId = categoryData.id;
    } else {
      const { data: newCategoryData, error: newCategoryError } = await supabase
        .from('categories')
        .insert([{ name: category }])
        .select('id')
        .single();
      if (newCategoryError) {
        console.error('Error creating category:', newCategoryError);
      } else {
        categoryId = newCategoryData.id;
      }
    }
  }
  
  const itemToInsert = { ...restOfItemData, category_id: categoryId};

  const { data, error } = await supabase.from('inventory').insert([itemToInsert]).select(`*, categories (name)`).single();
  if (error) {
    console.error('Error adding inventory item:', error);
    return null;
  }
  return data ? { ...data, category: data.categories?.name || 'Uncategorized', category_id: data.category_id } : null;
};

export const updateInventoryItem = async (itemId, itemData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: itemCheck, error: itemCheckError } = await supabase
    .from('inventory')
    .select('store_id, stores(user_id)')
    .eq('id', itemId)
    .single();

  if (itemCheckError || !itemCheck || itemCheck.stores.user_id !== user.id) {
      console.error('Error updating item or permission denied:', itemCheckError);
      return null;
  }


  const { category, ...restOfItemData } = itemData;
  let categoryId = itemData.category_id; 

  if (category && (!itemData.category_id || category !== itemData.categories?.name)) {
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', category)
      .single();

    if (categoryError && categoryError.code !== 'PGRST116') {
      console.error('Error fetching category:', categoryError);
    } else if (categoryData) {
      categoryId = categoryData.id;
    } else {
      const { data: newCategoryData, error: newCategoryError } = await supabase
        .from('categories')
        .insert([{ name: category }])
        .select('id')
        .single();
      if (newCategoryError) {
        console.error('Error creating category:', newCategoryError);
      } else {
        categoryId = newCategoryData.id;
      }
    }
  }
  
  const itemToUpdate = { ...restOfItemData, category_id: categoryId };
  delete itemToUpdate.categories; 
  delete itemToUpdate.store; 


  const { data, error } = await supabase.from('inventory').update(itemToUpdate).eq('id', itemId).select(`*, categories (name)`).single();
  if (error) {
    console.error('Error updating inventory item:', error);
    return null;
  }
  return data ? { ...data, category: data.categories?.name || 'Uncategorized', category_id: data.category_id } : null;
};


export const deleteInventoryItem = async (itemId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: itemCheck, error: itemCheckError } = await supabase
    .from('inventory')
    .select('store_id, stores(user_id)')
    .eq('id', itemId)
    .single();

  if (itemCheckError || !itemCheck || itemCheck.stores.user_id !== user.id) {
      console.error('Error deleting item or permission denied:', itemCheckError);
      return false;
  }

  const { error } = await supabase.from('inventory').delete().eq('id', itemId);
  if (error) {
    console.error('Error deleting inventory item:', error);
    return false;
  }
  return true;
};

export const getCategories = async () => {
  const { data, error } = await supabase.from('categories').select('name').order('name');
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data.map(c => c.name);
};