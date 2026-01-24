import { ThemeSelector } from "@/components/ThemeSelector";
import type { Component } from "solid-js";

export const Header: Component = () => (
  <header>
    <h1>MovieNite</h1>
    <ThemeSelector />
  </header>
);
