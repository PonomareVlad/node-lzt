import fetch, { FormData } from 'node-fetch'
import { LZTApiError } from './errors.js'

export class LZTApiCaller {
	constructor(options) {
		this.options = options
	}

	async call(method, path, params = {}) {
		const url = new URL(path, this.options.endpoint)
		const options = {
			...this.options.fetchParams,
			method,
			headers: {
				Authorization: `Bearer ${this.options.token}`,
				...this.options.fetchParams?.headers
			}
		}

		params.locale = params.locale || this.options.locale

		if(method === 'GET') {
			for(const key of Object.keys(params))
				if(params[key] !== undefined)
					url.searchParams.set(key, params[key])
		} else {
			options.body = new FormData()
			for(const key of Object.keys(params))
				if(params[key] !== undefined)
					options.body.set(key, params[key])
		}

		/* add queue and rate limits here? */
        const resp = await fetch(url.href, options)
        const text = await resp.text()
        let json

        try {
            json = await resp.json()
        } catch (e) {
            throw new LZTApiError(text)
        }

        if (json.errors)
            throw new LZTApiError(json.errors)
        if (json.error)
            throw new LZTApiError(json.error_description || json.error)

        return json

	}
}
