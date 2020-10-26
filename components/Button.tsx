import * as React from "react";

function Button({
  children,
  primary,
  rounded,
  disabled,
  ...props
}: {
  children: React.ReactChild;
  rounded?: boolean;
  primary?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element {
  return (
    <button
      css={(theme) => `
        font-weight: bold;
        font-size: 16px;
        border-width: 0px;
        border-radius: ${rounded ? "25px" : "5px"};
        cursor: pointer;
        padding: ${theme.spacing[1]} ${theme.spacing[3]};
        color: ${primary ? theme.colors.onPrimary : theme.colors.onBackground};
        background: ${
          primary ? theme.colors.primary : theme.colors.elevation.dp02
        };

        &:hover {
         opacity: 0.8;
        };
        
        ${disabled && `
          opacity: 0.5;
          cursor: not-allowed;
        `}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
