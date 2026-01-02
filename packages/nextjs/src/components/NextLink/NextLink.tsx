import NextJsLink from 'next/link';
import { Link as UILink } from '@r-ishino/sample-ui';
import type { LinkProps as UILinkProps } from '@r-ishino/sample-ui';
import type { FC, ReactElement } from 'react';

export type NextLinkProps = Omit<UILinkProps, 'customLink'>;

/**
 * Next.js Link component wrapped with UI styling from @r-ishino/sample-ui
 *
 * This component combines Next.js routing functionality with consistent UI styling.
 * It uses the customLink prop internally to apply @r-ishino/sample-ui's Link styles to Next.js Link.
 *
 * @example
 * ```tsx
 * <NextLink href="/about" variant="primary">
 *   About Page
 * </NextLink>
 * ```
 */
export const NextLink: FC<NextLinkProps> = ({
  href,
  children,
  ...props
}): ReactElement => (
  <UILink customLink={<NextJsLink href={href} />} href={href} {...props}>
    {children}
  </UILink>
);
