import { range } from "@/utils/pagination";
import { FaSolidCaretLeft, FaSolidCaretRight } from "solid-icons/fa";
import { Component, Show } from "solid-js"

interface PaginationControlsProps {
    show: boolean
    pageNum: number;
    totalPages: number;
    onPageChanged: (f: number) => void;
}

const PaginationControls: Component<PaginationControlsProps> = (props) => {
    return (
        <Show when={props.show}>
        <div class="pagination-controls">
            <button
                class={`page-button page-button-left`}
                onClick={() => props.onPageChanged(Math.max(props.pageNum - 1, 0))}
            >
                <FaSolidCaretLeft />
            </button>
            {range(0, props.totalPages - 1).map(n => (
                <button
                    class={`page-button ${props.pageNum == n ? "active" : ""}`}
                    onClick={() => props.onPageChanged(n)}
                >
                    {n + 1}
                </button>
            ))}
            <button
                class={`page-button page-button-right`}
                onClick={() => props.onPageChanged(Math.min(props.pageNum + 1, props.totalPages))}
            >
                <FaSolidCaretRight />
            </button>
        </div>
        </Show>
    );
};

export default PaginationControls;