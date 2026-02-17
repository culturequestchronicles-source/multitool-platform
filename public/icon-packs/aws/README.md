# AWS Icon Pack (Local)

This project can render **official AWS architecture icons** in the System Architecture diagram editor **without installing any npm icon packages**.

Why? In some environments, installing new dependencies from the npm registry is blocked. Instead, you can drop the official SVGs into `public/` and point a manifest at them.

## Folder layout

Create this folder structure:

```
public/
  icon-packs/
    aws/
      manifest.json
      icons/
        ...your AWS SVG/PNG files...
```

## `manifest.json`

The diagram editor loads the manifest from:

```
/icon-packs/aws/manifest.json
```

The file must match this shape:

```json
{
  "version": 1,
  "provider": "aws",
  "nodes": {
    "api_gateway": { "src": "/icon-packs/aws/icons/api-gateway.svg", "alt": "Amazon API Gateway" },
    "lambda": { "src": "/icon-packs/aws/icons/lambda.svg", "alt": "AWS Lambda" }
  }
}
```

### Keys you can map

The left side keys are the app's `ArchitectureNodeKind` values:

- `user`, `web`, `mobile`, `cdn`, `waf`, `api_gateway`, `auth_oidc`, `service`, `lambda`
- `event_bus`, `queue`, `cdc_stream`, `saga`
- `sql_db`, `nosql_db`, `object_store`, `search`
- `observability`, `metrics`, `logging`

You can also override per-node with **Properties → Icon Key** (stored as `node.data.meta.iconKey`).

## Adding more AWS icons

This repo already includes a small curated subset of AWS SVGs under `public/icon-packs/aws/icons/`.

To add more, download the official AWS Architecture Icons (SVG preferred) from AWS, then copy the specific SVGs you want into `public/icon-packs/aws/icons/` and update `public/icon-packs/aws/manifest.json`.
