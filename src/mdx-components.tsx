import type { MDXComponents } from "mdx/types";
import React, { Children } from "react";
import CopyableCode from "./components/copyableCode";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    pre: ({ children }) => {
      if (
        Children.only(children) &&
        Children.map(
          children,
          (child) => React.isValidElement(child) && child.type === "code"
        )
      ) {
        return <CopyableCode>{children}</CopyableCode>
      } else {
        return <pre>{children}</pre>;
      }
    },
    ...components,
  };
}