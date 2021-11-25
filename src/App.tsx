import { useState } from 'react';
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

const pickRandomFromArray = <T extends unknown>(arr: T[]) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const pickRandomDot = (): Dot => {
  return Object.values(Dot)[
    Math.floor(Math.random() * Object.values(Dot).length)
  ];
};

const generateMockData = (n: number): Item[] => {
  return Array.from({ length: n }, (_, idx) => ({
    id: idx,
    color: pickRandomFromArray(['blue', 'green', 'orange']),
    size: pickRandomFromArray(['small', 'large']),
    dot: pickRandomDot(),
  }));
};

function App() {
  const [items] = useState(generateMockData(21));
  const [selectedItems, setSelectedItems] = useState(Set<number>());

  const handleSelect = (id: number) => {
    if (selectedItems.has(id)) {
      setSelectedItems(selectedItems.delete(id));
    } else {
      setSelectedItems(selectedItems.add(id));
    }
  };
  console.log({ selectedItems: selectedItems.toJS() });

  return (
    <div className="App">
      <h3>Awesome</h3>
      <div className="container">
        {items.map((i, idx) => (
          <ItemBox
            key={idx}
            item={i}
            selected={selectedItems.has(i.id)}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}

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

export default App;
