import fs from "fs";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/__seed") {
      return new Response("Not found", { status: 404 });
    }

    const seedData = JSON.parse(fs.readFileSync("./seed-data.json", "utf8"));
    let created = 0;
    let errors = 0;

    for (const resource of seedData) {
      try {
        const id = `${resource.resourceType}:${resource.id}`;
        await env.FHIR_DB.prepare(
          `INSERT OR REPLACE INTO fhir_resources (id, resource_type, resource_id, patient_id, data)
           VALUES (?, ?, ?, ?, ?)`
        ).bind(
          id,
          resource.resourceType,
          resource.id,
          resource.subject?.reference?.replace("Patient/", "") || null,
          JSON.stringify(resource)
        ).run();
        created++;
      } catch (e) {
        errors++;
        console.error(`Error creating ${resource.resourceType}/${resource.id}: ${e.message}`);
      }
    }

    return new Response(JSON.stringify({
      status: "ok",
      message: `Seed complete: ${created} resources created, ${errors} errors`,
      total: seedData.length,
    }), { headers: { "content-type": "application/json" } });
  },
};
