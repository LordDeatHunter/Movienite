import { Accessor, createMemo, createSignal } from "solid-js";

export const usePagination = <T>(
    items: () => T[],
    itemsPerPage: Accessor<number> | number = () => 20
) => {
    const [currentPage, setCurrentPage] = createSignal(1);

    const getPageSize = () =>
        typeof itemsPerPage === "function" ? itemsPerPage() : itemsPerPage;

    const totalPages = createMemo(() => getPageSize() > 0 ? Math.ceil(items().length / getPageSize()) : 0);

    const paginatedItems = createMemo(() => {
        const perPage = getPageSize();
        if(!perPage || perPage == 0)
            return items();
        const start = (currentPage() - 1) * perPage;
        const end = start + perPage;
        return items().slice(start, end);
    });

    const goToPage = (page: number) => {
        const maxPage = totalPages();
        if(page >= 1 && page <= maxPage) {
            setCurrentPage(page);
        }
    };

    const nextPage = () => goToPage(currentPage() + 1);
    const previousPage = () => goToPage(currentPage() - 1);
    const reset = () => setCurrentPage(1);

    return {
        paginatedItems,
        currentPage,
        totalPages,
        goToPage,
        nextPage,
        previousPage,
        reset
    };
};