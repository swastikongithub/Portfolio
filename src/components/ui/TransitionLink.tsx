import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { useSite } from '../../context/site';

interface TransitionLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
}

/**
 * A real link (right-click, middle-click and modifier keys behave natively) whose
 * plain left click runs the lane transition before navigating.
 */
export const TransitionLink: React.FC<TransitionLinkProps> = ({ to, onClick, ...rest }) => {
  const { transitionTo } = useSite();

  return (
    <Link
      to={to}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        transitionTo(to);
      }}
      {...rest}
    />
  );
};
