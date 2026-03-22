// hooks/useBrand.ts
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface BrandConfig {
  brandName: string
  brandImageUrl: string | null
  primaryColor: string
  secondaryColor: string
}

const DEFAULTS: BrandConfig = {
  brandName: 'Mi Equipo',
  brandImageUrl: null,
  primaryColor: '#7D0531',
  secondaryColor: '#B05276',
}

export function useBrand(adminId?: string) {
  const [brand, setBrand] = useState<BrandConfig>(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!adminId) { setLoading(false); return }
    loadBrand(adminId)
  }, [adminId])

  async function loadBrand(id: string) {
    const { data } = await (supabase as any)
      .from('perfiles')
      .select('brand_name, brand_image_url, primary_color, secondary_color')
      .eq('id', id)
      .single()

    if (data) {
      const config: BrandConfig = {
        brandName:      data.brand_name      || DEFAULTS.brandName,
        brandImageUrl:  data.brand_image_url || null,
        primaryColor:   data.primary_color   || DEFAULTS.primaryColor,
        secondaryColor: data.secondary_color || DEFAULTS.secondaryColor,
      }
      setBrand(config)
      applyBrandCSS(config)
    }
    setLoading(false)
  }

  async function saveBrand(updates: Partial<BrandConfig>, adminId: string) {
    const { error } = await (supabase as any)
      .from('perfiles')
      .update({
        brand_name:      updates.brandName,
        brand_image_url: updates.brandImageUrl,
        primary_color:   updates.primaryColor,
        secondary_color: updates.secondaryColor,
      })
      .eq('id', adminId)

    if (!error) {
      const updated = { ...brand, ...updates }
      setBrand(updated)
      applyBrandCSS(updated)
    }
    return !error
  }

  async function uploadBrandImage(file: File, adminId: string): Promise<string | null> {
    // Validaciones
    const validTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!validTypes.includes(file.type)) return null
    if (file.size > 2 * 1024 * 1024) return null // 2MB max

    const ext = file.name.split('.').pop()
    const path = `${adminId}/logo.${ext}`

    const { error } = await supabase.storage
      .from('branding')
      .upload(path, file, { upsert: true })

    if (error) return null

    const { data } = supabase.storage
      .from('branding')
      .getPublicUrl(path)

    return data.publicUrl + '?t=' + Date.now()
  }

  return { brand, loading, saveBrand, uploadBrandImage, loadBrand }
}

export function applyBrandCSS(config: BrandConfig) {
  const root = document.documentElement
  root.style.setProperty('--color-primary',   config.primaryCo
