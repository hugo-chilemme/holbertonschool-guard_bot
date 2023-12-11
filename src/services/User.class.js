const getUserStatus = require('./functions/getUserStatus');
const ApiController = require('./Holberton');
const { _addRole, _removeRole, _sendMessage } = require('./functions/discordRolesUtils');

class User {

	constructor(user, member) {
		this.user = user;
		this.member = member;

		this.user.discord_id = member.user.id;
		this._config();
	}

	_config() {
		this.isActive = this.user.active;
		
		this.cohortStatus = getUserStatus(this.user);
		this.cohortName = `C#${this.user.cohort.number}`;
		this.isAlternating = this.user.products.filter(product => product.status === "In progress" && product.title.includes('Alternance France')).length > 0;

		if (this.cohortStatus === 'fundamental' && this.cohortName !== this.user.cache.fundamental_cohort)
			ApiController(`users/${this.user.id}/set`, {fundamental_cohort: this.cohortName});

		if (this.user.cache.fundamental_cohort && this.user.cache.fundamental_cohort.length >= 4)
			this.cohortName = this.user.cache.fundamental_cohort;

		this._synchronization();
		this._celebrateBirthday();
	}

	_synchronization() {

		roles.cohorts.forEach(CohortRole => {

			const functRole = CohortRole.name === this.cohortName ? _addRole : _removeRole;
			
			functRole(this.member, CohortRole);
			
		});

		const speFunctRole = this.isActive && this.cohortStatus === 'specialization' ? _addRole : _removeRole;
		speFunctRole(this.member, roles.specialization);

		const activeFunctRole = this.isActive && ['specialization', 'fundamental'].includes(this.cohortStatus) ? _addRole : _removeRole;
		activeFunctRole(this.member, roles.ActiveStudent);

		const alternanceFunctRole = this.isActive && this.isAlternating ? _addRole : _removeRole;
		alternanceFunctRole(this.member, roles.Alternance);

	}

	_celebrateBirthday() {
		if (!this.user.date_of_birth) return;
		
		const [years, months, days] = this.user.date_of_birth.split('-');
		const birthday_date = new Date(2023, months - 1, days);
		const today_date = new Date();

		const isSameDay = birthday_date.toDateString() === today_date.toDateString();
		const isTimeToSent = today_date.getHours() > 8;
		const isReadySent = this.user.cache.celebrate_years_birth == today_date.getFullYear();

		if (!isSameDay || !isTimeToSent || isReadySent)
			return;

		const celebrate_years_birth = today_date.getFullYear();
		this.user.cache.celebrate_years_birth = celebrate_years_birth;
		ApiController('users/'+this.user.id+'/set', {celebrate_years_birth});
		const age = today_date.getFullYear() - years;
		_sendMessage('976357520895528965', `"Il célèbre aujourd'hui son ${age}e anniversaire, souhaitons tous un joyeux anniversaire à <@${this.member.user.id}>. :partying_face: <@&1143248679180972053>`)
	}



}

module.exports = User;