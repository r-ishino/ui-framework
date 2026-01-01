import { describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  describe('レンダリング', () => {
    test('childrenが表示される', () => {
      render(<Button>Click me</Button>);
      expect(
        screen.getByRole('button', { name: 'Click me' })
      ).toBeInTheDocument();
    });

    test('button要素としてレンダリングされる', () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });
  });

  describe('variant', () => {
    test('デフォルトはprimaryでレンダリングされる', () => {
      render(<Button>Primary</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('variant=primaryでレンダリングできる', () => {
      render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('variant=secondaryでレンダリングできる', () => {
      render(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('variant=outlineでレンダリングできる', () => {
      render(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('size', () => {
    test('デフォルトはmdでレンダリングされる', () => {
      render(<Button>Medium</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test.each([
      ['sm', 'Small'],
      ['md', 'Medium'],
      ['lg', 'Large'],
    ] as const)('size=%sでレンダリングできる', (size, label) => {
      render(<Button size={size}>{label}</Button>);
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
  });

  describe('disabled', () => {
    test('disabled=falseの場合、ボタンが有効（デフォルト）', () => {
      render(<Button>Enabled</Button>);
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    test('disabled=trueの場合、ボタンが無効化される', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    test('disabled時はクリックイベントが発火しない', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('onClick', () => {
    test('onClickを指定しない場合でもレンダリングできる', () => {
      render(<Button>No onClick</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('クリック時にonClickが呼ばれる', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click</Button>);
      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('onClickにeventオブジェクトが渡される', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click</Button>);
      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
        })
      );
    });

    test('非同期onClickの場合、処理完了まで待機する', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn(
        async () => await new Promise((resolve) => setTimeout(resolve, 50))
      );

      render(<Button onClick={handleClick}>Async</Button>);
      const button = screen.getByRole('button');

      expect(button).not.toBeDisabled();

      // クリックを実行
      await user.click(button);

      // 処理完了後は有効化されている（状態更新を待つ）
      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('非同期onClick実行中は複数回クリックできない', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn(
        async () => await new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<Button onClick={handleClick}>Async</Button>);
      const button = screen.getByRole('button');

      // 1回目のクリック
      const click1 = user.click(button);

      // 2回目のクリック（disabled状態なので発火しない）
      await user.click(button);

      await click1;

      // onClickは1回だけ呼ばれる
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('HTML属性', () => {
    test('type属性を指定できる', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    test('className属性を指定できる', () => {
      render(<Button className="custom-class">Custom</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    test('data-testid属性を指定できる', () => {
      render(<Button data-testid="custom-button">Custom</Button>);
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });

    test('aria-label属性を指定できる', () => {
      render(<Button aria-label="Custom label">Icon</Button>);
      expect(
        screen.getByRole('button', { name: 'Custom label' })
      ).toBeInTheDocument();
    });
  });

  describe('組み合わせ', () => {
    test('variant、size、disabledを同時に指定できる', () => {
      render(
        <Button variant="outline" size="lg" disabled>
          Combined
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    test('すべてのpropsを組み合わせて使用できる', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Button
          variant="secondary"
          size="sm"
          onClick={handleClick}
          type="button"
          className="test-class"
        >
          All Props
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveClass('test-class');

      await user.click(button);
      expect(handleClick).toHaveBeenCalled();
    });
  });
});
