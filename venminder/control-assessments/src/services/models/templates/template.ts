// T4 generated file.  Do not manually modify.

import { TemplateTheme } from "../themes/theme";
import { TemplateStatus } from "shared/enums/template-statuses";
import { TemplateSection } from "./template-section";

export class Template {
	constructor (
		public templateTitle: string = null,
		public updated: Date = null,
		public notes: string = null,
		public status: TemplateStatus = <TemplateStatus>0,
		public templateType: string = null,
		public client: string = null,
		public level: string = null,
		public theme: TemplateTheme = null,
		public templateSections: TemplateSection[] = []
	) {
	}
	static create (item: Template = null, preserveNull: boolean = false): Template {
		return item == null
			? preserveNull ? null : new Template()
			: new Template(
				item.templateTitle,
				item.updated,
				item.notes,
				item.status,
				item.templateType,
				item.client,
				item.level,
				TemplateTheme.create(item.theme, preserveNull),
				(item.templateSections || []).map(_x => TemplateSection.create(_x, preserveNull))
			);
	}
};

