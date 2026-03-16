import { ref, computed } from 'vue'

export function usePagination(items, initialPageSize = 10) {
    const currentPage = ref(1)
    const pageSize = ref(initialPageSize)

    const totalItems = computed(() => items.value.length)
    const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))

    const paginatedItems = computed(() => {
        const start = (currentPage.value - 1) * pageSize.value
        const end = start + pageSize.value
        return items.value.slice(start, end)
    })

    // Watch for changes in items or page size to reset current page if needed
    // (Optional logic, for now stick to simple)

    const nextPage = () => {
        if (currentPage.value < totalPages.value) {
            currentPage.value++
        }
    }

    const prevPage = () => {
        if (currentPage.value > 1) {
            currentPage.value--
        }
    }

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page
        }
    }

    return {
        currentPage,
        pageSize,
        totalItems,
        totalPages,
        paginatedItems,
        nextPage,
        prevPage,
        goToPage
    }
}
