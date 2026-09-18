import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { useSite } from '../../context/site';

interface TransitionLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  /** Text shown on the page-turn curtain while the next page is set. */
  curtainLabel?: string;
}

/**
 * A real link (right-click, middle-click and modifier keys behave natively) whose
 * plain left click runs the page-turn transition before navigating.
 */
export const TransitionLink: React.FC<TransitionLinkProps> = ({ to, curtainLabel, onClick, ...rest }) => {
  const { transitionTo } = useSite();

  return (
    <Link
      to={to}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        transitionTo(to, curtainLabel);
      }}
      {...rest}
    />
  );
};
