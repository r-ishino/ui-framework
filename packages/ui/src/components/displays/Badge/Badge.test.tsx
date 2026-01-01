import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  describe('レンダリング', () => {
    test('childrenが表示される', () => {
      render(<Badge>Label</Badge>);
      expect(screen.getByText('Label')).toBeInTheDocument();
    });

    test('span要素としてレンダリングされる', () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge.tagName).toBe('SPAN');
    });
  });

  describe('important', () => {
    test('デフォルトはimportant=falseでレンダリングされる', () => {
      render(<Badge>Normal</Badge>);
      expect(screen.getByText('Normal')).toBeInTheDocument();
    });

    test('important=falseでレンダリングできる', () => {
      render(<Badge important={false}>Normal</Badge>);
      expect(screen.getByText('Normal')).toBeInTheDocument();
    });

    test('important=trueでレンダリングできる', () => {
      render(<Badge important>Important</Badge>);
      expect(screen.getByText('Important')).toBeInTheDocument();
    });

    test('importantの値によってスタイルが切り替わる', () => {
      const { rerender } = render(<Badge>Normal</Badge>);
      const badge = screen.getByText('Normal');
      const normalClasses = badge.className;

      rerender(<Badge important>Normal</Badge>);
      const importantClasses = badge.className;

      // classNameが異なることを確認（スタイルが切り替わっている）
      expect(normalClasses).not.toBe(importantClasses);
    });
  });

  describe('HTML属性', () => {
    test('className属性を指定できる', () => {
      render(<Badge className="custom-class">Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('custom-class');
    });

    test('data-testid属性を指定できる', () => {
      render(<Badge data-testid="custom-badge">Badge</Badge>);
      expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
    });

    test('id属性を指定できる', () => {
      render(<Badge id="badge-id">Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveAttribute('id', 'badge-id');
    });

    test('title属性を指定できる', () => {
      render(<Badge title="Badge tooltip">Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveAttribute('title', 'Badge tooltip');
    });
  });

  describe('children', () => {
    test('空文字列を表示できる', () => {
      render(<Badge data-testid="empty-badge">{''}</Badge>);
      const badge = screen.getByTestId('empty-badge');
      expect(badge).toBeInTheDocument();
      expect(badge.textContent).toBe('');
    });

    test('数字を含む文字列を表示できる', () => {
      render(<Badge>123</Badge>);
      expect(screen.getByText('123')).toBeInTheDocument();
    });

    test('特殊文字を含む文字列を表示できる', () => {
      render(<Badge>New!</Badge>);
      expect(screen.getByText('New!')).toBeInTheDocument();
    });

    test('日本語を表示できる', () => {
      render(<Badge>新着</Badge>);
      expect(screen.getByText('新着')).toBeInTheDocument();
    });
  });

  describe('組み合わせ', () => {
    test('importantとclassNameを同時に指定できる', () => {
      render(
        <Badge className="custom-class" important>
          Combined
        </Badge>
      );
      const badge = screen.getByText('Combined');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('custom-class');
    });

    test('すべてのpropsを組み合わせて使用できる', () => {
      render(
        <Badge
          className="test-class"
          data-testid="test-badge"
          id="badge-123"
          important
          title="Test badge"
        >
          All Props
        </Badge>
      );

      const badge = screen.getByTestId('test-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('test-class');
      expect(badge).toHaveAttribute('id', 'badge-123');
      expect(badge).toHaveAttribute('title', 'Test badge');
      expect(badge.textContent).toBe('All Props');
    });
  });
});
