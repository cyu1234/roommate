import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    children?: ReactNode;
};

export default function Button({
    variant = "primary",
    size = "md",
    fullWidth = false,
    className,
    children,
    ...props
}: ButtonProps) {
    const classes = [
        "btn",
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth && "btn--full",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button {...props} className={classes}>
            {children}
        </button>
    );
}
