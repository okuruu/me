import content from '$library/json/content.json';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Project } from '$library/types';

export const prerender = true;

export const entries = () =>
    (content.projects as Project[]).map((p) => ({ slug: p.slug }));

export const load: PageLoad = ({ params }) => {
    const projects = content.projects as Project[];
    const project = projects.find((p) => p.slug === params.slug);
    if (!project) throw error(404, `Project "${params.slug}" not found`);
    return { project };
};
