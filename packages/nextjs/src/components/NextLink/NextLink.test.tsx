import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { NextLink } from './NextLink';

// Next.js Linkをモック
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: ReactNode;
  } & AnchorHTMLAttributes<never>) => (
    <a {...props} href={href}>
      {children}
    </a>
  ),
}));

describe('NextLink', () => {
  describe('レンダリング', () => {
    test('childrenが表示される', () => {
      render(<NextLink href="/about">About</NextLink>);
      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    });

    test('href属性が設定される', () => {
      render(<NextLink href="/contact">Contact</NextLink>);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/contact');
    });
  });

  describe('variant', () => {
    test('デフォルトはprimaryでレンダリングされる', () => {
      render(<NextLink href="/test">Test</NextLink>);
      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    test('variant=primaryでレンダリングできる', () => {
      render(
        <NextLink href="/test" variant="primary">
          Primary
        </NextLink>
      );
      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    test('variant=secondaryでレンダリングできる', () => {
      render(
        <NextLink href="/test" variant="secondary">
          Secondary
        </NextLink>
      );
      expect(screen.getByRole('link')).toBeInTheDocument();
    });
  });

  describe('disabled', () => {
    test('disabled=falseの場合、リンクが有効（デフォルト）', () => {
      render(<NextLink href="/test">Enabled</NextLink>);
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).not.toHaveAttribute('aria-disabled', 'true');
    });

    test('disabled=trueの場合、リンクが無効化される', () => {
      render(
        <NextLink disabled href="/test">
          Disabled
        </NextLink>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('isExternal', () => {
    test('isExternal=trueで外部リンクを指定できる', () => {
      render(
        <NextLink href="https://example.com" isExternal>
          External Link
        </NextLink>
      );
      expect(screen.getByRole('link')).toBeInTheDocument();
    });
  });

  describe('HTML属性', () => {
    test('className属性を指定できる', () => {
      render(
        <NextLink className="custom-class" href="/test">
          Custom
        </NextLink>
      );
      expect(screen.getByRole('link')).toHaveClass('custom-class');
    });

    test('data-testid属性を指定できる', () => {
      render(
        <NextLink data-testid="custom-link" href="/test">
          Custom
        </NextLink>
      );
      expect(screen.getByTestId('custom-link')).toBeInTheDocument();
    });
  });

  describe('組み合わせ', () => {
    test('variant、disabled、isExternalを同時に指定できる', () => {
      render(
        <NextLink href="https://example.com" isExternal variant="secondary">
          Combined
        </NextLink>
      );
      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    test('すべてのpropsを組み合わせて使用できる', () => {
      render(
        <NextLink
          className="test-class"
          disabled
          href="/test"
          variant="primary"
        >
          All Props
        </NextLink>
      );

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveClass('test-class');
      expect(link).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
