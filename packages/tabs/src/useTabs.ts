/**
 * Copyright Zendesk, Inc.
 *
 * Use of this source code is governed under the Apache License, Version 2.0
 * found at http://www.apache.org/licenses/LICENSE-2.0.
 */

import { useMemo } from 'react';
import { useUIDSeed } from 'react-uid';
import {
  useSelection,
  IGetItemPropsOptions,
  IUseSelectionState,
  IUseSelectionProps
} from '@zendeskgarden/container-selection';

interface IGetTabProps<Item> extends IGetItemPropsOptions<Item> {
  index: number;
}

interface IGetTabPanelProps<Item> extends React.HTMLProps<any> {
  index: number;
  item: Item;
}

export interface IUseTabsReturnValue<Item> extends IUseSelectionState<Item> {
  getTabProps: <T extends IGetItemPropsOptions<Item>>(options?: T) => any;
  getTabPanelProps: <T extends IGetTabPanelProps<Item>>(options?: T) => any;
  getTabListProps: <T>(options?: T) => T & React.HTMLProps<any>;
}

export interface IUseTabsProps<Item> extends IUseSelectionProps<Item> {
  /** Determines the orientation of the tabs */
  vertical?: boolean;
  /** Prefix used for generating tab element IDs */
  idPrefix?: string;
}

function requiredArguments(arg: any, argStr: string, methodName: string) {
  if (typeof arg === 'undefined' || arg === null) {
    throw new Error(
      `Accessibility Error: You must provide an "${argStr}" option to "${methodName}()"`
    );
  }
}

export function useTabs<Item = any>({
  vertical,
  idPrefix,
  ...options
}: IUseTabsProps<Item> = {}): IUseTabsReturnValue<Item> {
  const { selectedItem, focusedItem, getContainerProps, getItemProps } = useSelection<Item>({
    direction: vertical ? 'vertical' : 'horizontal',
    defaultSelectedIndex: 0,
    ...options
  });
  const seed = useUIDSeed();
  const _id = useMemo(() => idPrefix || seed(`tabs_${PACKAGE_VERSION}`), [idPrefix, seed]);
  const PANEL_ID = `${_id}--panel`;
  const TAB_ID = `${_id}--tab`;

  const getTabListProps = ({ role = 'tablist', ...other }: React.HTMLProps<any> = {}) => {
    return {
      role,
      'aria-orientation': vertical ? 'vertical' : 'horizontal',
      'data-garden-container-id': 'containers.tabs',
      'data-garden-container-version': PACKAGE_VERSION,
      ...other
    };
  };

  const getTabProps = ({ role = 'tab', index, ...other }: IGetTabProps<Item> = {} as any) => {
    requiredArguments(index, 'index', 'getTabProps');

    return {
      id: `${TAB_ID}:${index}`,
      'aria-controls': `${PANEL_ID}:${index}`,
      role,
      ...other
    };
  };

  const getTabPanelProps = (
    { role = 'tabpanel', index, item, ...other }: IGetTabPanelProps<Item> = {} as any
  ) => {
    requiredArguments(index, 'index', 'getTabPanelProps');
    requiredArguments(item, 'item', 'getTabPanelProps');

    const isHidden = item !== selectedItem;

    return {
      role,
      id: `${PANEL_ID}:${index}`,
      hidden: isHidden,
      'aria-labelledby': `${TAB_ID}:${index}`,
      ...other
    };
  };

  return {
    selectedItem,
    focusedItem,
    getTabPanelProps,
    getTabListProps: props => getContainerProps(getTabListProps(props) as any),
    getTabProps: props => getItemProps(getTabProps(props as any), 'getTabProps')
  };
}
