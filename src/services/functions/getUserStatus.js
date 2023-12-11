function getDateStart(monthAndYear) {
	const day = '08';
	const [ month, year ] = monthAndYear.split(/(..)/g).filter(s => s);


	const date = new Date();
	date.setYear('20' + year);
	date.setMonth(parseInt(month) - 1);
	date.setDate(day);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	date.setHours(9);

	return date;
}

module.exports = function (user) {
	const { id, name, number } = user.cohort;

	const date_start = getDateStart(name.split('-')[1]);
	const date_end = new Date(date_start.getTime());
		date_end.setMonth(date_start.getMonth() + 9);
	const date_now = new Date();

	if (date_now < date_start)
		return 'not_yet_start';
	if (date_now > date_start && date_now < date_end)
		return 'fundamental';
	// Alumni ?
	return 'specialization';

}