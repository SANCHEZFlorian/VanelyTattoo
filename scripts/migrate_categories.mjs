
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrateCategories() {
    console.log('Auditing categories...')

    // 1. Audit Flash Tattoos
    const { data: flashItems } = await supabase.from('flash_tattoos').select('id, categories')
    for (const item of flashItems || []) {
        if (item.categories) {
            const normalized = item.categories.map(c => c.toLowerCase())
            // Check if unchanged
            if (JSON.stringify(normalized) !== JSON.stringify(item.categories)) {
                console.log(`Updating Flash #${item.id}: ${item.categories} -> ${normalized}`)
                await supabase.from('flash_tattoos').update({ categories: normalized }).eq('id', item.id)
            }
        }
    }

    // 2. Audit Gallery Items
    const { data: galleryItems } = await supabase.from('gallery_items').select('id, categories')
    for (const item of galleryItems || []) {
        if (item.categories) {
            const normalized = item.categories.map(c => c.toLowerCase())
            // Check if unchanged
            if (JSON.stringify(normalized) !== JSON.stringify(item.categories)) {
                console.log(`Updating Gallery #${item.id}: ${item.categories} -> ${normalized}`)
                await supabase.from('gallery_items').update({ categories: normalized }).eq('id', item.id)
            }
        }
    }

    console.log('Migration complete.')
}

migrateCategories()
