import * as azureDevops from "azure-devops-node-api";
import { IRequestHandler } from "azure-devops-node-api/interfaces/common/VsoBaseInterfaces";
import { GitPullRequestCommentThread } from "azure-devops-node-api/interfaces/GitInterfaces";

interface IPullRequestInfo {
  id: number;
  repoId: string;
}

let vstsUrl = "https://watchmixer.visualstudio.com";
let project = "Mixer";

var token = "";
var authHandler: IRequestHandler = azureDevops.getPersonalAccessTokenHandler(
  token
);
let vsts = new azureDevops.WebApi(vstsUrl, authHandler);

async function getPullRequestInfo(
  _vsts: azureDevops.WebApi,
  buildId: number
): Promise<IPullRequestInfo> {
  // let connData = await _vsts.connect();
  let buildApi = await vsts.getBuildApi();
  return buildApi.getBuild(buildId, project).then(build => {
    return {
      id:
        build && build.triggerInfo && build.triggerInfo["pr.number"]
          ? parseInt(build.triggerInfo["pr.number"])
          : null,
      repoId:
        build && build.repository && build.repository.id
          ? build.repository.id
          : null
    };
  });
}

async function exec(): Promise<void> {
  // const prId = await getPullRequestId(vsts, 42108);
  const prInfo = await getPullRequestInfo(vsts, 38208);
  await postComments(vsts, prInfo);
}

async function postComments(
  vsts: azureDevops.WebApi,
  pr: IPullRequestInfo
): Promise<void> {
  let gitApi = await vsts.getGitApi();

  let thread: GitPullRequestCommentThread = {
    comments: [
      {
        content: "gg"
      }
    ],
    status: 1
  };

  await gitApi.createThread(thread, pr.repoId, pr.id, project);
}

exec();
