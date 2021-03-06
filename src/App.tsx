import { useCallback, useMemo, useState } from 'react';
import cx from 'classnames';
import './App.scss';
import { Set } from 'immutable';

enum Dot {
  Dot = 'dot',
  NoDot = 'no-dot',
}

type Item = {
  id: number;
  dot: Dot;
  color: string;
  size: string;
};

const pickRandomFromArray = <T extends unknown>(arr: Readonly<T[]>) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const toPercent = (x: number) => {
  return `${Math.round(x * 100)}%`;
};

const pickRandomDot = (): Dot => {
  return Object.values(Dot)[
    Math.floor(Math.random() * Object.values(Dot).length)
  ];
};

const colors = ['blue', 'green', 'orange'] as const;
const sizes = ['small', 'large'] as const;

const generateMockData = (n: number): Item[] => {
  return Array.from({ length: n }, (_, idx) => ({
    id: idx,
    color: pickRandomFromArray(colors),
    size: pickRandomFromArray(sizes),
    dot: pickRandomDot(),
  }));
};

const App = () => {
  const [items] = useState(generateMockData(21));
  const [history, setHistory] = useState([Set<number>()]);

  const selectedIds = useMemo(() => {
    return history[history.length - 1];
  }, [history]);

  const handleSelect = useCallback(
    (id: number) => {
      if (selectedIds.has(id)) {
        setHistory((s) => [...s, selectedIds.delete(id)]);
      } else {
        setHistory((s) => [...s, selectedIds.add(id)]);
      }
    },
    [selectedIds]
  );

  const handleUndo = useCallback(() => {
    if (history.length > 1) {
      setHistory((s) => s.slice(0, -1));
    }
  }, [history.length]);

  const [target] = useState<{
    propName: keyof Item;
    value: Item[keyof Item];
    ratio: number;
  }>({
    propName: 'dot',
    value: 'no-dot',
    ratio: 0.6,
  });

  return (
    <div className="App">
      <button onClick={handleUndo}>undo</button>
      <Stats target={target} items={items} selectedIds={selectedIds} />
      <div className="container">
        {items.map((i, idx) => (
          <ItemBox
            key={idx}
            item={i}
            selected={selectedIds.has(i.id)}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
};

const ItemBox = ({
  item: { id, dot, size, color },
  selected,
  onSelect,
}: {
  item: Item;
  selected: boolean;
  onSelect: (id: number) => void;
}) => {
  return (
    <div
      className={cx('item-wrapper', selected && 'selected')}
      onClick={() => onSelect(id)}
    >
      <div
        className={cx(
          'item',
          dot === Dot.Dot && 'has-dot',
          `color-${color}`,
          `size-${size}`
        )}
      ></div>
    </div>
  );
};

const Stats = ({
  target,
  items,
  selectedIds,
}: {
  target: { propName: keyof Item; value: Item[keyof Item]; ratio: number };
  items: Item[];
  selectedIds: Set<number>;
}) => {
  const { actual, difference } = useMemo(() => {
    const { propName, value, ratio } = target;
    const selectedItems = items.filter((item) => selectedIds.has(item.id));

    if (selectedItems.length === 0) {
      return {
        actual: 0,
        difference: target.ratio,
      };
    }

    const itemsMatchingTarget = selectedItems.filter(
      (i) => i[propName] === value
    );
    const actual = itemsMatchingTarget.length / selectedItems.length;
    const difference = Math.abs(actual - ratio);
    return {
      actual,
      difference,
    };
  }, [items, selectedIds, target]);

  return (
    <div className="stats">
      <div>
        {capitalize(String(target.value))} Target: {toPercent(target.ratio)}
      </div>
      <TargetChart actual={actual} target={target.ratio} />
      <div className="live-stats">
        <div>Actual: {toPercent(actual)}</div>
        <div>Difference: {toPercent(difference)}</div>
      </div>
    </div>
  );
};

const TargetChart = ({
  actual,
  target,
}: {
  actual: number;
  target: number;
}) => {
  return (
    <div className="target-chart">
      <div className="marker-wrapper">
        <div className="marker" style={{ left: toPercent(target) }}></div>
      </div>
      <div className="center-line"></div>
      <div className="marker-wrapper">
        <div
          className="marker bottom-marker"
          style={{ left: toPercent(actual) }}
        ></div>
      </div>
    </div>
  );
};

export default App;
