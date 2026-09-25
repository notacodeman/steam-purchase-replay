// Steam's store-wide seasonal sales, used for the "During Steam's seasonal sales" figures.
//
// Each sale runs from `start` to `end` inclusive (sales end at 10am Pacific on the last day). A Winter Sale is named
// after the year it started in.
//
// To add a sale: append a line in date order and move `coveredUntil` to its last day. Valve publishes the dates
// months ahead at https://partner.steamgames.com/doc/marketing/upcoming_events. Purchases after `coveredUntil` are
// left out of the figures rather than counted as bought outside a sale.
//
// Sources: SteamDB's sale calendar and Valve's Steamworks docs (2023 on); prepareyourwallet.com and the Steam
// Community "Steam Sales History" guide (earlier years). The 2006 Holiday Sale was the first store-wide seasonal sale.
// No Spring Sale before 2023 could be confirmed, so none is listed.

const STEAM_SALES = {
  coveredUntil: '2027-07-08',
  sales: [
    { type: 'Winter', start: '2006-12-23', end: '2007-01-04' },
    { type: 'Winter', start: '2007-12-24', end: '2008-01-01' },
    { type: 'Winter', start: '2008-12-26', end: '2009-01-02' },
    { type: 'Winter', start: '2009-12-23', end: '2010-01-03' },
    { type: 'Summer', start: '2010-06-24', end: '2010-07-04' },
    { type: 'Winter', start: '2010-12-20', end: '2011-01-02' },
    { type: 'Summer', start: '2011-06-30', end: '2011-07-10' },
    { type: 'Autumn', start: '2011-11-23', end: '2011-11-27' },
    { type: 'Winter', start: '2011-12-19', end: '2012-01-01' },
    { type: 'Summer', start: '2012-07-12', end: '2012-07-23' },
    { type: 'Autumn', start: '2012-11-21', end: '2012-11-26' },
    { type: 'Winter', start: '2012-12-20', end: '2013-01-05' },
    { type: 'Summer', start: '2013-07-11', end: '2013-07-22' },
    { type: 'Autumn', start: '2013-11-27', end: '2013-12-03' },
    { type: 'Winter', start: '2013-12-19', end: '2014-01-03' },
    { type: 'Summer', start: '2014-06-19', end: '2014-06-30' },
    { type: 'Autumn', start: '2014-11-26', end: '2014-12-02' },
    { type: 'Winter', start: '2014-12-18', end: '2015-01-02' },
    { type: 'Summer', start: '2015-06-11', end: '2015-06-22' },
    { type: 'Autumn', start: '2015-11-25', end: '2015-12-01' },
    { type: 'Winter', start: '2015-12-22', end: '2016-01-04' },
    { type: 'Summer', start: '2016-06-23', end: '2016-07-04' },
    { type: 'Autumn', start: '2016-11-23', end: '2016-11-29' },
    { type: 'Winter', start: '2016-12-22', end: '2017-01-02' },
    { type: 'Summer', start: '2017-06-22', end: '2017-07-05' },
    { type: 'Autumn', start: '2017-11-22', end: '2017-11-28' },
    { type: 'Winter', start: '2017-12-21', end: '2018-01-04' },
    { type: 'Summer', start: '2018-06-21', end: '2018-07-05' },
    { type: 'Autumn', start: '2018-11-21', end: '2018-11-27' },
    { type: 'Winter', start: '2018-12-20', end: '2019-01-03' },
    { type: 'Summer', start: '2019-06-25', end: '2019-07-09' },
    { type: 'Autumn', start: '2019-11-26', end: '2019-12-03' },
    { type: 'Winter', start: '2019-12-19', end: '2020-01-02' },
    { type: 'Summer', start: '2020-06-25', end: '2020-07-09' },
    { type: 'Autumn', start: '2020-11-25', end: '2020-12-01' },
    { type: 'Winter', start: '2020-12-22', end: '2021-01-05' },
    { type: 'Summer', start: '2021-06-24', end: '2021-07-08' },
    { type: 'Autumn', start: '2021-11-24', end: '2021-12-01' },
    { type: 'Winter', start: '2021-12-22', end: '2022-01-05' },
    { type: 'Summer', start: '2022-06-23', end: '2022-07-07' },
    { type: 'Autumn', start: '2022-11-22', end: '2022-11-29' },
    { type: 'Winter', start: '2022-12-22', end: '2023-01-05' },
    { type: 'Spring', start: '2023-03-16', end: '2023-03-23' },
    { type: 'Summer', start: '2023-06-29', end: '2023-07-13' },
    { type: 'Autumn', start: '2023-11-21', end: '2023-11-28' },
    { type: 'Winter', start: '2023-12-21', end: '2024-01-04' },
    { type: 'Spring', start: '2024-03-14', end: '2024-03-21' },
    { type: 'Summer', start: '2024-06-27', end: '2024-07-11' },
    { type: 'Autumn', start: '2024-11-27', end: '2024-12-04' },
    { type: 'Winter', start: '2024-12-19', end: '2025-01-02' },
    { type: 'Spring', start: '2025-03-13', end: '2025-03-20' },
    { type: 'Summer', start: '2025-06-26', end: '2025-07-10' },
    { type: 'Autumn', start: '2025-09-29', end: '2025-10-06' },
    { type: 'Winter', start: '2025-12-18', end: '2026-01-05' },
    { type: 'Spring', start: '2026-03-19', end: '2026-03-26' },
    { type: 'Summer', start: '2026-06-25', end: '2026-07-09' },
    { type: 'Autumn', start: '2026-10-01', end: '2026-10-08' },
    { type: 'Winter', start: '2026-12-17', end: '2027-01-04' },
    { type: 'Spring', start: '2027-03-18', end: '2027-03-25' },
    { type: 'Summer', start: '2027-06-24', end: '2027-07-08' },
  ],
};
