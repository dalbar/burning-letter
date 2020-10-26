/**
 * Generic title component for fitting dark mode
 **/
import * as React from "react";

interface TitleProps {
  children: React.ReactChild;
}

function Title({ children }: TitleProps): JSX.Element {
  return (
    <div
      className="title"
      css={(theme) => `
     color: ${theme.colors.onBackground};
     opacity: 0.6;
     font-size: 1.1rem;
     margin-bottom: ${theme.spacing[5]};
`}
    >
      {children}
    </div>
  );
}

export default Title;
