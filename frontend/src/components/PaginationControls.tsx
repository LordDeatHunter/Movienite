import { range } from "@/utils/pagination";
import { FaSolidCaretLeft, FaSolidCaretRight } from "solid-icons/fa";
import { Component } from "solid-js"

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onGoToPage: (f: number) => void;
    onNext: () => void;
    onPrevious: () => void;
}

const PaginationControls: Component<PaginationControlsProps> = (props) => {
    return (
        <div class="pagination-controls">
            <button
                class={`page-button page-button-left`}
                onClick={props.onPrevious}
            >
                <FaSolidCaretLeft />
            </button>
            {range(1, props.totalPages).map(n => (
                <button
                    class={`page-button ${props.currentPage == n ? "active" : ""}`}
                    onClick={() => props.onGoToPage(n as number)}
                >
                    {n}
                </button>
            ))}
            <button
                class={`page-button page-button-right`}
                onClick={props.onNext}
            >
                <FaSolidCaretRight />
            </button>
        </div>
    );
};

export default PaginationControls;