import { useRouter } from 'next/router';
import Link, { LinkProps } from 'next/link';
import { ReactElement, cloneElement } from 'react';

interface ActiveLinkProps extends LinkProps {
  children: ReactElement,
  activeClassName: string;
}

export default function ActiveLink({ children, activeClassName, ...rest }: ActiveLinkProps){
  const { asPath } = useRouter();
  
  const className = asPath === rest.href
  ? activeClassName
  : '';

  return (
    <Link {...rest} className={className}>
      {children}
    </Link>
  );
}