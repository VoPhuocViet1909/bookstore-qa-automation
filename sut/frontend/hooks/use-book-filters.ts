"use client"

import { useState, useMemo } from "react"

export interface FilterState {
  searchTerm: string
  activeAvailability: string
  priceRange: [number, number]
  activeCategory: string
}

export interface FilterActions {
  setSearchTerm: (term: string) => void
  setActiveAvailability: (availability: string) => void
  setPriceRange: (range: [number, number]) => void
  setActiveCategory: (category: string) => void
  resetFilters: () => void
}

const defaultFilters: FilterState = {
  searchTerm: "",
  activeAvailability: "all",
  priceRange: [0, 400000],
  activeCategory: "Tất cả"
}

export function useBookFilters(books: any[]) {
  const [filterState, setFilterState] = useState<FilterState>(defaultFilters)

  const categories = useMemo(() => {
    const unique = new Set(books.map((book) => book.category))
    return ["Tất cả", ...Array.from(unique)]
  }, [books])

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(filterState.searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(filterState.searchTerm.toLowerCase())
      const matchesAvailability =
        filterState.activeAvailability === "all" ||
        (filterState.activeAvailability === "in-stock" && book.inStock) ||
        (filterState.activeAvailability === "out-of-stock" && !book.inStock)
      const matchesCategory = 
        filterState.activeCategory === "Tất cả" || book.category === filterState.activeCategory
      const matchesPrice = 
        book.price >= filterState.priceRange[0] && book.price <= filterState.priceRange[1]

      return matchesSearch && matchesAvailability && matchesCategory && matchesPrice
    })
  }, [books, filterState])

  const actions: FilterActions = {
    setSearchTerm: (term: string) => 
      setFilterState(prev => ({ ...prev, searchTerm: term })),
    setActiveAvailability: (availability: string) => 
      setFilterState(prev => ({ ...prev, activeAvailability: availability })),
    setPriceRange: (range: [number, number]) => 
      setFilterState(prev => ({ ...prev, priceRange: range })),
    setActiveCategory: (category: string) => 
      setFilterState(prev => ({ ...prev, activeCategory: category })),
    resetFilters: () => setFilterState(defaultFilters)
  }

  return {
    filterState,
    filteredBooks,
    categories,
    actions
  }
}