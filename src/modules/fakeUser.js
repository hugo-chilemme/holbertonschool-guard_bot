module.exports = {
	/**
	 * Developer mode
	 * Create a fake user
	 * @param {string} tag
	 * @param {number} id
	 * @param {boolean} active
	 * @returns {object}
	 * @example fakeUser.create("discord_tag", 1234, true)
	 */
	create: (tag = "justgod", id = 1312, active = false) => {
		return {
			"cache": {
				"fundamental_cohort": "C#22",
				"first_name": "Henri",
				"last_name": "JavaScript"
			},
			"active": active,
			"cohort": {
				"id": 427,
				"name": "TLS-1023",
				"number": 22
			},
			"current_projects": [
				{
					"completion": 0,
					"id": 2174,
					"name": "C - Simple Shell",
					"score": null,
					"started_at": "2023-09-28T03:12:07.000Z",
					"ended_at": null,
					"release_date": "2023-12-11",
					"deadline_date": "2023-12-22"
				}
			],
			"first_name": "Henri",
			"id": id,
			"last_name": "JavaScript",
			"slack_id": "U05U9FP3K3L",
			"product": {
				"average": 100,
				"optional_average": 5.52,
				"overall_average": 100,
				"professional_average": 100,
				"code": "208",
				"cohort": {
					"id": 427,
					"name": "TLS-1023",
					"number": 22
				},
				"completion": 98.13,
				"end_date": "2023-12-22",
				"id": 208,
				"start_date": "2023-10-02",
				"title": "Foundations v2 - Part 1"
			},
			"discord_tag": tag,
			"username": "Henri JavaScript",
			"products": [
				{
					"average": 100,
					"code": "208",
					"cohort": {
						"id": 427,
						"name": "TLS-1023",
						"number": 22
					},
					"completion": 98.13,
					"end_date": "2023-12-22",
					"id": 208,
					"status": "In progress",
					"start_date": "2023-10-02",
					"title": "Foundations v2 - Part 1",
					"projects": [
						{
							"id": 2436,
							"name": "Shell, navigation",
							"release_date": "2023-10-02",
							"deadline_date": "2023-10-08",
							"score": 100
						}
					]
				}
			],
			"fundamental_cohort": "C#22",
		};
	}
}