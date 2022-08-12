import React, { useEffect, useState } from 'react';
import { fetch, window } from 'global';
import useSiteMetadata from '../lib/useSiteMetadata';
import { Stat } from '../basics/Stat';

const fetchNpmDownloads = async (npmApiUrls) => {
  const promises = Object.values(npmApiUrls).map(async (uri) => {
    const response = await fetch(uri);
    const json = await response.json();

    return json.downloads;
  });

  const results = await Promise.all(promises);

  return results.reduce((a, b) => a + b, 0);
};

export const NpmDownloadCount = (props) => {
  const [state, setState] = useState({ loading: true, npmDownloads: 0 });
  const { urls = {} } = useSiteMetadata();
  const { npm, npmApi } = urls;

  let npmDownloadsFixed = parseInt((state.npmDownloads / 1000).toFixed(0), 10);
  let npmDownloadsDisplay = `${npmDownloadsFixed}k`;
  if (npmDownloadsFixed >= 1000) {
    npmDownloadsFixed = (npmDownloadsFixed / 1000).toFixed(2);
    npmDownloadsDisplay = `${npmDownloadsFixed}m`;
  }

  useEffect(() => {
    if (!window.sessionStorage.getItem('monthlyNpmDownloads')) {
      fetchNpmDownloads(npmApi).then((npmDownloadCount) => {
        setState({ loading: false, npmDownloads: npmDownloadCount });
        window.sessionStorage.setItem('monthlyNpmDownloads', parseInt(npmDownloadCount, 10));
      });
    } else {
      setState({
        loading: false,
        npmDownloads: window.sessionStorage.getItem('monthlyNpmDownloads'),
      });
    }
  }, [npmApi]);

  return (
    <Stat
      count={npmDownloadsDisplay}
      text="Installs per month"
      noPlural
      countLink={npm}
      isLoading={state.loading}
      {...props}
    />
  );
};
